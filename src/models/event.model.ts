import mongoose, { Document, Schema } from "mongoose";
import { IEvent } from "../interface/event.interface";

const eventSchema = new Schema<IEvent>(
  {
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: Number,
      required: true,
    },
    Venue: {
      type: String,
      required: false, //not required for oauth
    },
    date: {
      type: Date,
      required: true,
    },
    Price: {
      type: String,
      required: false,
    },
    Files: {
      type: [String],
      required: false,
    },
    Images: {
      // Add exampleId field
      type: [String],
      required: false,
    },
    mainImage: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
    },
    bookedTickets: {
      type: Number,
    },

    creatorId: { type: mongoose.Schema.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model<IEvent>("Event", eventSchema);

// Export the User model
export default Event;
