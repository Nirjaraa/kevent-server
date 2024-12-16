import { errorHandler } from "../utils/error-handler";
import Event from "../models/event.model";
import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import Notification from "../models/notification.model";
import { cloudinary } from "../db/cloudinaryConfig";

//CREATE EVENT
// const createEvent = async (req: Request, res: Response) => {
//   try {
//     const { Title, Description, contactNumber, Venue, date, Price } = req.body;
//     const userId = req.user.id;
//     if (!Title || !Description || !contactNumber || !Venue || !date || !Price) {
//       return res.status(400).json({ error: ":Please add all the fields." });
//     }

//     const eventDate = new Date(date);
//     const currentDate = new Date();

//     // Check if the event date is less than the current date
//     if (eventDate < currentDate) {
//       return res.status(400).json({ error: "The event date cannot be in the past." });
//     }
//     const existingEvent = await Event.findOne({ Title, date });

//     if (existingEvent) {
//       return res.status(400).json({ error: "An event with the same title and date already exists." });
//     }

//     let mainImageUrl = "";
//     if (req.file && req.file.path) {
//       try {
//         console.log("req.file (mainImage):", req.file); // Check if the mainImage file is received
//         console.log("req.files:", req.files); // Check for all other uploaded files
//         const mainImageResult = await cloudinary.uploader.upload(req.file.path);
//         mainImageUrl = mainImageResult.secure_url;
//         console.log(" bhayo");
//       } catch (error) {
//         console.error("Cloudinary main image upload failed:", error);
//         return res.status(500).json({ error: "Image upload failed. Please try again later." });
//       }
//     }
//     // Additional images handling
//     let imagesUrls: string[] = [];

//     if (req.files && Array.isArray(req.files)) {
//       const uploadPromises = req.files.slice(0, 5).map((file) => cloudinary.uploader.upload(file.path));
//       // Await all uploads and store URLs
//       const uploadResults = await Promise.all(uploadPromises);
//       imagesUrls = uploadResults.map((result) => result.secure_url);
//     }

//     let pdfUrls: string[] = [];
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] }; // Type assertion

//     // Check if pdfFile exists and is an array of files
//     if (files?.Files && Array.isArray(files.Files) && files.Files.length > 0) {
//       const uploadPromises = files.Files.map(async (file) => {
//         const pdfResult = await cloudinary.uploader.upload(file.path, {
//           resource_type: "raw", // Upload PDFs as raw files
//         });
//         return pdfResult.secure_url; // Return the secure URL of each uploaded PDF
//       });

//       // Wait for all PDF uploads and collect their URLs
//       pdfUrls = await Promise.all(uploadPromises);
//     }

//     // Collect all URLs (PDFs and Images) into an array
//     const allFilesUrls = [...pdfUrls];

//     const creatingEvent = await Event.create({
//       Title,
//       Description,
//       contactNumber,
//       Venue,
//       date,
//       Price,
//       Files: allFilesUrls,
//       Images: imagesUrls,
//       userId,
//       mainImage: mainImageUrl,
//     });
//     console.log("Files received:", req.files); // Log all uploaded files
//     console.log("File received:", req.file); // Log the single file
//     console.log("Request Body:", req.body); // Log request body
//     return res.status(201).json({ message: "Event created successfully.", creatingEvent });
//   } catch (error) {
//     const errorMessage = errorHandler(error as Error);
//     return res.status(500).json({ error: errorMessage });
//   }
// };
const createEvent = async (req: Request, res: Response) => {
  try {
    const { Title, Description, contactNumber, Venue, date, Price, Files } = req.body;
    const userId = req.user.id;
    if (!Title || !Description || !contactNumber || !Venue || !date || !Price) {
      return res.status(400).json({ error: ":Please add all the fields." });
    }

    const eventDate = new Date(date);
    const currentDate = new Date();

    if (eventDate < currentDate) {
      return res.status(400).json({ error: "The event date cannot be in the past." });
    }
    const existingEvent = await Event.findOne({ Title, date });

    if (existingEvent) {
      return res.status(400).json({ error: "An event with the same title and date already exists." });
    }

    let mainImageUrl = "";
    if (req.file && req.file.path) {
      const mainImageResult = await cloudinary.uploader.upload(req.file.path);
      mainImageUrl = mainImageResult.secure_url;
      console.log("Main Image URL:", mainImageUrl);
    }
    // Additional images handling
    let imagesUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      const uploadPromises = req.files.slice(0, 5).map((file) => cloudinary.uploader.upload(file.path));

      // Await all uploads and store URLs
      const uploadResults = await Promise.all(uploadPromises);
      imagesUrls = uploadResults.map((result) => result.secure_url);
    } // Handle main image (single file)

    console.log("Request Body:", req.body);
    console.log("Request File (Single Image):", req.file);
    console.log("Request Files (Multiple Images):", req.files);
    console.log("Main Image URL:", mainImageUrl);

    const creatingEvent = await Event.create({
      Title,
      Description,
      contactNumber,
      Venue,
      date,
      Price,
      Files,
      Images: imagesUrls,
      userId,
      mainImage: mainImageUrl,
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
    const { Title, Description, contactNumber, Venue, date, Price, Images, Files, mainImage, capacity } = req.body;
    const tickets = await Ticket.find({ eventId }).select("userId ");
    const existingEvent = await Event.findById(eventId);

    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (existingEvent.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "You are not authorized to update this event." });
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, { Title, Description, contactNumber, Venue, date, Price, Images, Files, mainImage, capacity }, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event was not updated." });
    }
    await Promise.all(tickets.map((ticket) => Notification.create({ userId: ticket.userId, eventId, type: "Updated Event", message: `${Title} has been updated.` })));
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
    await Promise.all(tickets.map((ticket) => Notification.create({ userId: ticket.userId, eventId, type: "Deleted Event", message: `${eventTitle} has been deleted.` })));

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
