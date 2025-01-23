import { errorHandler } from "../utils/error-handler";
import Event from "../models/event.model";
import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import Notification from "../models/notification.model";
import User from "../models/User.model";
import * as XLSX from "xlsx";
import { sendEmail } from "../utils/sendEmail";
import { EventCategory, EventClub, EventDepartment } from "../models/eventCategory";

const createEvent = async (req: Request, res: Response) => {
  try {
    const { Title, Description, contactNumber, Venue, date, Price, department, club, capacity, category } = req.body;

    const userId = req.user.id;
    if (!Title || !Description || !contactNumber || !Venue || !date || !Price) {
      return res.status(400).json({ error: ":Please add all the fields." });
    }

    const uploads = req.files;

    if (new Date(date) < new Date()) return res.status(400).json({ error: "The event date cannot be in the past." });

    const existingEvent = await Event.findOne({ Title, date });
    if (existingEvent) return res.status(400).json({ error: "An event with the same title and date already exists." });

    let mainImage = "";
    let Files: string[] = [];
    let Images: string[] = [];

    const isObject = !Array.isArray(uploads) && typeof uploads === "object";

    if (isObject) {
      for (const key in uploads) {
        if (uploads[key].length == 1 && uploads[key][0].fieldname == "mainImage") mainImage = uploads[key][0].path;
        else if (uploads[key][0].fieldname == "files") Files = uploads[key].map((obj) => obj.path);
        else if (uploads[key][0].fieldname == "otherImages") Images = uploads[key].map((obj) => obj.path);
      }
    }

    const creatingEvent = await Event.create({
      Title,
      Description,
      contactNumber,
      Venue,
      date,
      Price,
      Files,
      Images,
      userId,
      mainImage,
      department,
      club,
      capacity,
      category,
    });

    return res.status(201).json({ message: "Event created successfully.", creatingEvent });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//UPDATE EVENT
const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { Title, Description, contactNumber, Venue, date, Price, capacity, department, club, category } = req.body;
    const tickets = await Ticket.find({ eventId }).select("userId ");
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (existingEvent.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "You are not authorized to update this event." });
    }
    const uploads = req.files;
    let mainImage = existingEvent.mainImage; // Retain existing mainImage
    let Files = existingEvent.Files || [];
    let Images = existingEvent.Images || [];

    const isObject = !Array.isArray(uploads) && typeof uploads === "object";

    if (isObject) {
      for (const key in uploads) {
        if (uploads[key].length === 1 && uploads[key][0].fieldname === "mainImage") {
          mainImage = uploads[key][0].path; // Update mainImage
        } else if (uploads[key][0].fieldname === "files") {
          Files = uploads[key].map((obj) => obj.path); // Update Files
        } else if (uploads[key][0].fieldname === "otherImages") {
          Images = uploads[key].map((obj) => obj.path); // Update Images
        }
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        Title: Title || existingEvent.Title,
        Description: Description || existingEvent.Description,
        contactNumber: contactNumber || existingEvent.contactNumber,
        Venue: Venue || existingEvent.Venue,
        date: date || existingEvent.date,
        Price: Price || existingEvent.Price,
        capacity: capacity || existingEvent.capacity,
        department: department || existingEvent.department,
        club: club || existingEvent.club,
        category: category || existingEvent.category,
        mainImage,
        Files,
        Images,
      },
      { new: true } // Return the updated document
    );
    if (!updatedEvent) {
      return res.status(404).json({ error: "Event was not updated." });
    }
    const eventTitle = updatedEvent.Title;
    await Promise.all(
      tickets.map(async (ticket) => {
        const user = await User.findById(ticket.userId); // Assuming you have a User model
        if (user) {
          const subject = `${eventTitle} has been updated.`;
          const text = `Dear ${user.firstName},\n\nThe event "${eventTitle}" you booked has been updated.\n\nBest regards,\nKevent Team`;
          await sendEmail(user.email, subject, text);
        }

        // Send one notification for the update (not per ticket)
        await Notification.create({
          userId: ticket.userId,
          eventId,
          type: "Updated Event",
          message: `${eventTitle} has been updated.`,
          isRead: false,
        });
      })
    );
    return res.status(200).json({ message: "Event updated successfully." });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//DELETE EVENT
const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (existingEvent.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this event." });
    }
    const deletedEvent = await Event.findByIdAndDelete(eventId);
    const tickets = await Ticket.find({ eventId });
    if (tickets.length > 0) {
      await Ticket.deleteMany({ eventId });
    }
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    const eventTitle = existingEvent.Title;

    await Promise.all(
      tickets.map(async (ticket) => {
        const user = await User.findById(ticket.userId);
        if (user) {
          const subject = `${eventTitle} has been deleted.`;
          const text = `Dear ${user.firstName},\n\nThe event "${eventTitle}" you booked has been deleted.\n\nBest regards,\nKevent Team`;
          await sendEmail(user.email, subject, text);
        }

        await Notification.create({
          userId: ticket.userId,
          eventId,
          type: "Deleted Event",
          message: `${eventTitle} has been deleted.`,
          isRead: false,
        });
      })
    );
    return res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//VIEW ALL EVENTS(FEED IG)
const viewAllEvents = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find events where the date is today or in the future
    const events = await Event.find({ date: { $gte: today } }, "-createdAt -updatedAt").sort({ date: 1 }); // Sort by date

    return res.status(200).json({ message: "Events:", events });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//VIEW A PARTICULAR EVENT
const viewAnEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId, "-createdAt -updatedAt");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(200).json({ message: "Event details:", event });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//SEARCH EVENTS
const searchEvents = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ error: "Please add all fields " });
    }
    const regex = new RegExp(search.toString(), "i"); // 'i' for case-insensitive search
    const eventExists = await Event.find({
      $or: [{ department: regex }, { Title: regex }, { category: regex }, { club: regex }],
    }).sort({ date: -1 });

    if (!eventExists.length) {
      return res.status(400).json({ error: "Event doesn't exist" });
    }

    return res.status(201).json({ message: "Search Successful", event: eventExists });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//View File
const exportData = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const tickets = await Ticket.find({ eventId });
    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: "No bookings found for this event" });
    }
    const users = await Promise.all(
      tickets.map(async (ticket) => {
        const user = await User.findById(ticket.userId).select("firstName lastName email");
        if (user) {
          return {
            userId: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            contactNumber: ticket.contactNumber,
          };
        }
      })
    );
    const filteredUsers = users.filter((user) => user !== null);
    const worksheetData = filteredUsers.map((user) => ({
      "First Name": user?.firstName,
      "Last Name": user?.lastName,
      Email: user?.email,
      "Contact Number": user?.contactNumber,
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
      header: ["First Name", "Last Name", "Email", "Contact Number"], // Define the headers
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    // Write the workbook to a buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    // Set headers for the file download
    res.setHeader("Content-Disposition", `attachment; filename=users_event_${eventId}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.status(201).send(buffer);
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//Filtered Events
const getEventsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (!category || !Object.values(EventCategory).includes(category as EventCategory)) {
      return res.status(400).json({
        message: "Invalid category or category not provided",
      });
    }

    const events = await Event.find({ category }).exec();

    if (events.length === 0) {
      return res.status(404).json({
        message: "No events found for this category",
      });
    }

    return res.status(200).json({ message: "Filtered events", events });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

const getEventsByDepartment = async (req: Request, res: Response) => {
  try {
    const { department } = req.query;

    if (!department || !Object.values(EventDepartment).includes(department as EventDepartment)) {
      return res.status(400).json({
        message: "Invalid department  is not provided",
      });
    }

    const events = await Event.find({ department }).exec();

    if (events.length === 0) {
      return res.status(404).json({
        message: "No events found for this department",
      });
    }

    return res.status(200).json({ message: "Filtered events", events });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

const getEventsByClub = async (req: Request, res: Response) => {
  try {
    const { club } = req.query;

    if (!club || !Object.values(EventClub).includes(club as EventClub)) {
      return res.status(400).json({
        message: "Invalid club  is not provided",
      });
    }

    const events = await Event.find({ club }).exec();

    if (events.length === 0) {
      return res.status(404).json({
        message: "No events found for this club",
      });
    }

    return res.status(200).json({ message: "Filtered events", events });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};
export { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents, exportData, getEventsByCategory, getEventsByDepartment, getEventsByClub };
