"use strict";
// import mongoose from "mongoose";
// import { errorHandler } from "../utils/error-handler";
// import Event from "../models/event.model";
// import { isValidObjectId } from "../utils/isValidObjectId";
// import { Request, Response } from "express";
// import Ticket from "../models/ticket.model";
// import { calculateBookedTickets } from "../controllers/event.controllers";
// const bookTickets = async (req: Request, res: Response) => {
//   try {
//     const userId = req.user?.id
//     const eventId = req.params.id;
//     const { ticketCount } = req.body;
//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ error: "Event not found." });
//     }
//     const bookedTickets = await calculateBookedTickets(eventId:);
//     const totalBooked = bookedTickets + ticketCount;
//     if (event.capacity && totalBooked > event.capacity) {
//       return res.status(400).json({ error: "Not enough capacity available." });
//     }
//     const newTicket = await Ticket.create({
//       userId,
//       eventId,
//       ticketCount,
//     });
//     return res.status(201).json({ message: "Tickets booked successfully.", ticket: newTicket });
//   } catch (error) {
//     const errorMessage = errorHandler(error as Error);
//     return res.status(500).json({ error: errorMessage });
//   }
// };
// export { bookTickets };
