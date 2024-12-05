import express from "express";
import { auth } from "../firebase";

const router = express.Router();

// Middleware to verify Firebase ID tokens
const verifyToken = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ message: "Forbidden", error });
  }
};

// Example route: Public (No auth required)
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Auth API!" });
});

// Example route: Create a user
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await auth.createUser({ email, password });
    res.json({ message: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ message: "Error creating user", error });
  }
});

export default router;
