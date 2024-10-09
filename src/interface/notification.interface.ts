import mongoose from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // User who receives the notification
  message: string; // The notification message
  type: string; // Type of notification (e.g., 'booking', 'update', 'reminder', 'confirmation')
  isRead: boolean; // Status of the notification
  createdAt: Date; // Timestamp when the notification was created
}
