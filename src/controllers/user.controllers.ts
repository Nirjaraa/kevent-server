import mongoose from "mongoose";
import { errorHandler } from "../utils/error-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import { isValidObjectId } from "../utils/isValidObjectId";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sendEmail, sendOtp } from "../utils/sendEmail";
const { v4: uuidv4 } = require("uuid");

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

//FORGOT-PASSWORD

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const otp = uuidv4().slice(0, 6); // Generate a simple 6-character OTP
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 300000); // OTP expires in 5 minutes
    await user.save();
    const emailText = sendOtp(user.firstName, otp); // Create the email content
    const subject = "Verification code";

    await sendEmail(user.email, subject, emailText); // Send the email
    console.log(email);
    console.log(otp);
    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//CHANGE PASSWORD
const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).send("Password changed successfully");
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//UPDATE PROFILE
const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const { firstName, lastName, email, password, batch, department, avatarURL } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, password, batch, department, avatarURL },
      { new: true, runValidators: true } // Return updated document and validate
    ).select("-password -createdAt -resetPasswordOtp -resetPasswordOtpExpires -updatedAt");

    // Handle case where the user is not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Your profile has been updated", user });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};
export { registerUsers, login, forgotPassword, changePassword, updateProfile };
