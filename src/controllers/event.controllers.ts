import { errorHandler } from "../utils/error-handler";
import Event from "../models/event.model";
import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import Notification from "../models/notification.model";

const createEvent = async (req: Request, res: Response) => {
  try {
    const { Title, Description, contactNumber, Venue, date, Price, department, club, category } = req.body;

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
    await Promise.all(tickets.map((ticket) => Notification.create({ userId: ticket.userId, eventId, type: "Updated Event", message: `${Title} has been updated.`, isRead: false })));
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
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found." });
    }
    await Ticket.deleteMany({ eventId });

    const eventTitle = existingEvent.Title;
    await Promise.all(tickets.map((ticket) => Notification.create({ userId: ticket.userId, eventId, type: "Deleted Event", message: `${eventTitle} has been deleted.`, isRead: false })));

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

const uploadmainImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    // Retrieve the uploaded image URL from Cloudinary
    const mainImage = req.file?.path;

    // Find the event by its ID
    const event = await Event.findById(req.params.eventId); // Use req.params to get the event ID

    if (!event) {
      return res.status(404).send({ message: "Event not found." });
    }

    // If the event already has a main image, update it; otherwise, set a new one
    const updatedEvent = await Event.findByIdAndUpdate(req.params.eventId, { mainImage }, { new: true });

    if (!updatedEvent) {
      return res.status(404).send({ message: "Error updating the event." });
    }

    res.status(200).json({
      message: updatedEvent.mainImage ? "Image updated successfully!" : "Image uploaded successfully for the first time!",
      mainImage: updatedEvent.mainImage, // Send the updated image URL in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Something went wrong." });
  }
};

export { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents, uploadmainImage };
