import express from "express";
import { getNotifications } from "../controllers/notification.controllers";
import { isUser } from "../middlware/auth-Middleware";

const router = express.Router();

router.get("/notification", isUser, getNotifications);

export default router;
