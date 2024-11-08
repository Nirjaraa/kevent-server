// src/controllers/notification.controller.ts

import Notification from "../models/notification.model";
import { Request, Response } from "express";

// Create a notification
const createNotification = async (req: Request, res: Response) => {
  const { userId, message, type } = req.body;

  try {
    const notification = await Notification.create({ userId, message, type });
    res.status(201).json(notification); // Send the created notification as a response
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" }); // Send error response
  }
};

// Get all notifications for a user
const getNotificationsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params; // Assume userId is passed as a route parameter

  try {
    const notifications = await Notification.find({ userId });
    res.status(200).json(notifications); // Send notifications as a response
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" }); // Send error response
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req: Request, res: Response) => {
  const { notificationId } = req.params; // Assume notificationId is passed as a route parameter

  try {
    const updatedNotification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    res.status(200).json(updatedNotification); // Send the updated notification as a response
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" }); // Send error response
  }
};

// Delete a notification
const deleteNotification = async (req: Request, res: Response) => {
  const { notificationId } = req.params; // Assume notificationId is passed as a route parameter

  try {
    await Notification.findByIdAndDelete(notificationId);
    res.status(204).send(); // Send no content response on successful deletion
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" }); // Send error response
  }
};

export { createNotification, getNotificationsByUser, markNotificationAsRead, deleteNotification };
