import mongoose, { Document, Schema } from "mongoose";
import { INotification } from "../interface/notification.interface";

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
