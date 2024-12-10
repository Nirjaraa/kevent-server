import { Router } from "express";
const router: Router = Router();
import { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents, uploadmainImage } from "../controllers/event.controllers";
import { isUser } from "../middlware/auth-Middleware";
import multer from "multer";
import { storage } from "../db/cloudinaryConfig";

const imageUpload = multer({ storage: storage });

router.post("/createevent", isUser, imageUpload.single("mainImage"), createEvent);
router.put("/updateevent/:id", isUser, updateEvent);
router.delete("/deleteevent/:id", isUser, deleteEvent);
router.get("/viewevents", viewAllEvents);
router.get("/viewevent/:id", viewAnEvent);
router.get("/search", searchEvents);
router.post("/uploadmainImage/:eventId", isUser, imageUpload.single("main"), uploadmainImage);

export default router;
