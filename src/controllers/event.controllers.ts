import mongoose from "mongoose";
import { errorHandler } from "../utils/error-handler";
import Event from "../models/event.model";
import { isValidObjectId } from "../utils/isValidObjectId";
import { Request, Response } from "express";

//CREATE EVENT
const createEvent = async (req: Request, res: Response) => {
  try {
    const { Title, Description, contactNumber, Venue, date, Price, Files, Images, mainImage } = req.body;

    if (!Title || !Description || !contactNumber || !Venue || !date || !Price || !mainImage) {
      return res.status(400).json({ error: ":Please add all the fields." });
    }
    const existingEvent = await Event.findOne({ Title, Date });

    if (existingEvent) {
      return res.status(400).json({ error: "An event with the same title and date already exists." });
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
      mainImage,
    });
    return res.status(201).json({ message: "Event created successfully." });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//UPDATE EVENT
const updateEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const { Title, Description, contactNumber, Venue, date, Price, Images, Files, mainImage } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(eventId, { Title, Description, contactNumber, Venue, date, Price, Images, Files, mainImage }, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event was not updated." });
    }
    return res.status(200).json({ message: "Appointment updated successfully." });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//DELETE EVENT
const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

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
      $or: [{ department: regex }, { Title: regex }],
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

export { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents };
