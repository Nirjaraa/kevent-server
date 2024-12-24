import Notification from "../models/notification.model";
import { Request, Response } from "express";
import { errorHandler } from "../utils/error-handler";

const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    return res.status(200).json({
      notifications,
      unreadCount, // Include unread count
    });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

export { getNotifications };
