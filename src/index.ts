import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";
import ticketRoutes from "./routes/ticket.route";
import notificationRoutes from "./routes/notification.route";
import authRoutes from "./routes/authRoutes";
import cors from "cors";

dotenv.config();
connectDB();
const app: Application = express();

app.use(express.json());

const allowedOrigins = process.env.NODE_ENV === "production" ? ["https://kevent-ggkh.vercel.app"] : ["http://localhost:3001"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);
app.use("/notifications", notificationRoutes);
app.use("/", authRoutes);

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Kevent backend server!");
});

app.listen(port, () => {
  console.log(`Backend connected successfully on port ${port}`);
});
