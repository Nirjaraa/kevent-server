import { errorHandler } from "../utils/error-handler";
import Event from "../models/event.model";
import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import QRCode from "qrcode";
import Notification from "../models/notification.model";

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

    // Book the tickets if capacity allows
    const newTicket = await Ticket.create({
      userId,
      eventId,
      ticketCount,
    });
    const qrData = `User ID: ${userId}, Event ID: ${eventId}, Ticket Count: ${ticketCount}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData); // Generates QR code as a data URL

    const notification = await Notification.create({ userId, eventId, type: "Booked Tickets", message: `You have successfully booked ${ticketCount} tickets for the ${event.Title}.` });

    return res.status(201).json({
      message: "Tickets booked successfully.",
      ticket: newTicket,
      qrCode: qrCodeUrl, // Include QR code in the response
    });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

export { bookTickets };
