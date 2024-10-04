import { Router } from "express";
const router: Router = Router();
import { createEvent, updateEvent, deleteEvent, viewAllEvents, viewAnEvent, searchEvents } from "../controllers/event.controllers";

router.post("/createevent", createEvent);
router.put("/updateevent/:id", updateEvent);
router.delete("/deleteevent/:id", deleteEvent);
router.get("/viewevents", viewAllEvents);
router.get("/viewevent/:id", viewAnEvent);
router.get("/search", searchEvents);

export default router;
