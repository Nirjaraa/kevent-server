import { Router } from "express";
const router: Router = Router();
import { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents, exportData, getEventsByCategory } from "../controllers/event.controllers";
import { isUser } from "../middlware/auth-Middleware";
import multer from "multer";
import { storage, uploadMiddleware } from "../db/cloudinaryConfig";

const upload = multer({ storage: storage });

router.post("/createevent", isUser, uploadMiddleware, createEvent);
router.put("/updateevent/:id", isUser, uploadMiddleware, updateEvent);
router.delete("/deleteevent/:id", isUser, deleteEvent);
router.get("/viewevents", viewAllEvents);
router.get("/viewevent/:id", viewAnEvent);
router.get("/search", searchEvents);
router.get("/export/:id", isUser, exportData);
router.get("/eventsByCategory", getEventsByCategory);

export default router;
