import { Router } from "express";
const router: Router = Router();
import { bookTickets } from "../controllers/ticket.controllers";
import { isUser } from "../middlware/auth-Middleware";

router.post("/booktickets/:id", isUser, bookTickets);

export default router;
