import Notification from "../models/notification.model";

const createNotification = async (userId: string, message: string, type: string) => {
  try {
    await Notification.create({ userId, message, type });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

// Get all notifications for a user
const getNotificationsByUser = async (userId: string) => {
  try {
    return await Notification.find({ userId });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
};
// // Mark a notification as read
// const markNotificationAsRead = async (notificationId: string) => {
//   try {
//     await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
//   } catch (error) {
//     console.error("Error marking notification as read:", error);
//     throw new Error("Failed to mark notification as read");
//   }
// };

// // delete notifications
// const deleteNotification = async (notificationId: string) => {
//   try {
//     await Notification.findByIdAndDelete(notificationId);
//   } catch (error) {
//     console.error("Error deleting notification:", error);
//     throw new Error("Failed to delete notification");
//   }
// };

export { createNotification };
