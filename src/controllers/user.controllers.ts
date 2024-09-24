import mongoose from "mongoose";
import { errorHandler } from "../utils/error-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { isValidObjectId } from "../utils/isValidObjectId";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";

//SIGNUP
const registerUsers = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, batch, department, avatarURL } = req.body;
    if (!firstName || !lastName || !email || !password || !batch || !department) {
      return res.status(400).json({ error: ":Please add all the fields." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: hashedPassword,
      batch: batch,
      department: department,
    });
    const userWithoutPassword = await User.findById(newUser._id).select("-password");

    res.status(201).json({ message: "User registered successfully", user: userWithoutPassword });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//LOGIN

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "3h",
  });
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return res.status(201).json({ message: "Login Successful", token: generateToken(user.id), user });
    }

    return res.status(404).json({ error: "Invalid Email and Password" });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

export { registerUsers, login };
