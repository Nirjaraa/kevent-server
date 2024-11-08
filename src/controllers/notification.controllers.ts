import Notification from "../models/notification.model";
import { Request, Response } from "express";

const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

export { getNotifications };
