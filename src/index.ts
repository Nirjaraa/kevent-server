import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./db/connectDB";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";
import ticketRoutes from "./routes/ticket.route";
import notificationRoutes from "./routes/notification.route";
import cors from "cors";

dotenv.config();
connectDB();
const app: Application = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // Allow your frontend to connect
  },
});

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

// Use routes
app.use("/users", userRoutes);
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);
app.use("/notifications", notificationRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Here, you can define any custom Socket.IO events
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Export `io` instance to use in notification service if needed
export { io };

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the port 3000");
});

app.listen(port, () => {
  console.log(`Connected successfully on port ${port}`);
});
