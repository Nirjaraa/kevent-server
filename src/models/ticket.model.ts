import mongoose, { Document, Schema } from "mongoose";
import { ITicket } from "../interface/tickets.interface";

const ticketSchema = new Schema<ITicket>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event",
  },
  capacity: {
    type: Number,
  },

  ticketCount: {
    type: Number,
  },
});

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

// Export the User model
export default Ticket;
