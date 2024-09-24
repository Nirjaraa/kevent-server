import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB";
import userRoutes from "./routes/user.route";

dotenv.config();
connectDB();
const app: Application = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the port 3000");
});

app.use("/users", userRoutes);

app.listen(port, () => {
  console.log(`Connected successfully on port ${port}`);
});
