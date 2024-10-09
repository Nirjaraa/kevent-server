import { Router } from "express";
const router: Router = Router();
import { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents } from "../controllers/event.controllers";
import { isUser } from "../middlware/auth-Middleware";

router.post("/createevent", isUser, createEvent);
router.put("/updateevent/:id", isUser, updateEvent);
router.delete("/deleteevent/:id", isUser, deleteEvent);
router.get("/viewevents", viewAllEvents);
router.get("/viewevent/:id", viewAnEvent);
router.get("/search", searchEvents);

export default router;
