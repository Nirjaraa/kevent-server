import express from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controllers";
import { isUser } from "../middlware/auth-Middleware";

const router = express.Router();

router.get("/notification", isUser, getNotifications);
router.get("/notification/markAsRead", isUser, markAsRead);

export default router;
