import { errorHandler } from "../utils/error-handler";
import Event from "../models/event.model";
import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import QRCode from "qrcode";
import Notification from "../models/notification.model";
import cron from "node-cron";
import { sendEmail } from "../utils/sendEmail";
import User from "../models/User.model";

const bookTickets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated. Please log in." });
    }

    const eventId = req.params.id;
    const { ticketCount } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const tickets = await Ticket.find({ eventId });
    const bookedTickets = tickets.reduce((total: number, ticket) => {
      const ticketCount = ticket.ticketCount || 0;
      return total + Number(ticketCount);
    }, 0);

    const totalBooked = bookedTickets + ticketCount;

    if (event.capacity != null && totalBooked > event.capacity) {
      return res.status(400).json({ error: "Not enough capacity available." });
    }

    const newTicket = await Ticket.create({
      userId,
      eventId,
      ticketCount,
    });

    const qrData = `User ID: ${userId}, Event ID: ${eventId}, Ticket Count: ${ticketCount}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);

    const eventDate = new Date(event.date);
    eventDate.setHours(9, 0, 0);

    const reminderCronTime = `${eventDate.getMinutes()} ${eventDate.getHours()} ${eventDate.getDate()} ${eventDate.getMonth() + 1} *`;
    cron.schedule(reminderCronTime, async () => {
      await Notification.create({
        userId,
        eventId,
        type: "Event Reminder",
        message: `Reminder: The event "${event.title}" is happening today!`,
        isRead: false,
      });
    });

    const eventCronTime = `${eventDate.getMinutes()} ${eventDate.getHours()} ${eventDate.getDate()} ${eventDate.getMonth() + 1} *`;
    cron.schedule(eventCronTime, async () => {
      await Notification.create({
        userId,
        eventId,
        type: "Event Happening Now",
        message: `The event "${event.title}" is happening now!`,
        isRead: false,
      });
    });

    await Notification.create({
      userId,
      eventId,
      type: "Booked Tickets",
      message: `You have successfully booked ${ticketCount} tickets for the event "${event.Title}".`,
      isRead: false,
    });

    // Send email to the user about the ticket booking
    const user = await User.findById(userId); // Get user info
    if (user) {
      const subject = `Ticket Booking Confirmation for ${event.Title}`;
      const text = `Dear ${user.firstName},\n\nYou have successfully booked ${ticketCount} tickets for the event "${event.Title}".\n\nYour tickets are confirmed, and you can use the attached QR code for event entry.\n\nBest regards,\nThe Kevent Team`;
      await sendEmail(user.email, subject, text); // Send email to user
    }

    return res.status(201).json({
      message: "Tickets booked successfully.",
      ticket: newTicket,
      qrCode: qrCodeUrl,
    });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

export { bookTickets };
