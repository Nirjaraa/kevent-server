import { Router } from "express";
const router: Router = Router();
import { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents } from "../controllers/event.controllers";
import { isUser } from "../middlware/auth-Middleware";
import multer from "multer";
import { NextFunction, Response, Request } from "express";
import { storage } from "../db/cloudinaryConfig";

// const upload = multer({ storage: storage });

// // Your route handler
// router.post(
//   "/createevent",
//   isUser,
//   upload.fields([
//     { name: "mainImage", maxCount: 1 },
//     { name: "images", maxCount: 5 },
//     { name: "Files", maxCount: 3 },
//   ]), // Multer handles file uploads here
//   (req: Request, res: Response, next: NextFunction) => {
//     console.log("Request headers:", req.headers);
//     console.log("Request body:", req.body);
//     next(); // Move to the next middleware
//   },
//   // Multer handles file uploads
//   (req: Request, res: Response) => {
//     console.log("Request body (after multer):", req.body); // Form data (excluding files)
//     console.log("Uploaded files:", req.files); // Processed files from multer
//   },
//   createEvent // Your custom function to handle event creation
// );
const upload = multer({ storage: storage });

router.post("/createevent", isUser, upload.single("mainImage"), upload.array("Images", 5), createEvent);
router.put("/updateevent/:id", isUser, updateEvent);
router.delete("/deleteevent/:id", isUser, deleteEvent);
router.get("/viewevents", viewAllEvents);
router.get("/viewevent/:id", viewAnEvent);
router.get("/search", searchEvents);

export default router;
