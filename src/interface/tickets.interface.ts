import mongoose from "mongoose";

export interface ITicket extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  eventId: mongoose.Schema.Types.ObjectId;
  capacity: Number;
  ticketCount: Number;
  contactNumber: Number;
}
