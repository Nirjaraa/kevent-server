import Notification from "../models/notification.model";
import { Request, Response } from "express";
import { errorHandler } from "../utils/error-handler";

const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      unreadCount,
    });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
};

export { getNotifications, markAsRead };
