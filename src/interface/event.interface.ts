import mongoose from "mongoose";
export interface IEvent extends Document {
  Title: String;
  Description: String;
  contactNumber: Number;
  Venue: String;
  date: Date;
  Price: Number;
  Files?: String[];
  Images?: String[];
  mainImage?: String;
  time?: Number;
  capacity?: Number;
  bookedTickets?: Number;
  creatorId: mongoose.Schema.Types.ObjectId;
}
