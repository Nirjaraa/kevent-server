import { Router } from "express";
const router: Router = Router();
import { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents } from "../controllers/event.controllers";
import { isUser } from "../middlware/auth-Middleware";
import multer from "multer";
import { NextFunction, Response, Request } from "express";
import { storage } from "../db/cloudinaryConfig";

const upload = multer({ storage: storage });

router.post(
  "/createevent",
  isUser,
  upload.fields([
    { name: "mainImage", maxCount: 1 }, // Expect a single file for 'mainImage'
    { name: "Images", maxCount: 5 }, // Expect up to 5 files for 'Images'
  ]),
  createEvent
);
router.put("/updateevent/:id", isUser, updateEvent);
router.delete("/deleteevent/:id", isUser, deleteEvent);
router.get("/viewevents", viewAllEvents);
router.get("/viewevent/:id", viewAnEvent);
router.get("/search", searchEvents);

export default router;
