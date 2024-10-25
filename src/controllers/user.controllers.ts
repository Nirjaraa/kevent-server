import mongoose from "mongoose";
import { errorHandler } from "../utils/error-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import { sendEmail, sendOtp, verifyEmails } from "../utils/sendEmail";
import Ticket from "../models/ticket.model";
const { v4: uuidv4 } = require("uuid");
import { Parser as Json2csvParser } from "json2csv";

//SIGNUP
const registerUsers = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, batch, department, year, avatarURL } = req.body;
    if (!firstName || !lastName || !email || !password || !batch || !department || !!year) {
      return res.status(400).json({ error: ":Please add all the fields." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationCode = generateVerificationCode();

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password: hashedPassword,
      batch: batch,
      department: department,
      year: year,
      verificationCode,
      emailVerified: false,
    });
    const emailText = verifyEmails(newUser.firstName, verificationCode);
    const subject = "Email Verification";

    await sendEmail(email, subject, emailText);

    const userWithoutPassword = await User.findById(newUser._id).select("-password -createdAt -updatedAt verificationCode emailVerified");

    res.status(201).json({ message: "OTP has been sent to your email verify it to register.", user: userWithoutPassword });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//VERIFY EMAIL
const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email, verificationCode });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    user.emailVerified = true;

    await user.save();

    return res.status(200).json({ message: "Email verified successfully." });
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

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ error: "Email not verified. Please verify your email before logging in." });
    }
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

    const otp = uuidv4().slice(0, 6);
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 300000);
    await user.save();
    const emailText = sendOtp(user.firstName, otp);
    const subject = "Verification code";

    await sendEmail(user.email, subject, emailText);

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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Your profile has been updated", user });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};
const viewTickets = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const tickets = await Ticket.find({ userId });
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: "No tickets found" });
    }
    return res.status(200).json({ message: "Tickets found successfully", tickets });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//RESEND OTP
const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otp = uuidv4().slice(0, 6);
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 300000);
    await user.save();

    const emailText = sendOtp(user.firstName, otp);
    const subject = "New OTP for Verification";
    await sendEmail(user.email, subject, emailText);

    return res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};
export { registerUsers, login, forgotPassword, changePassword, updateProfile, viewTickets, verifyEmail, resendOtp };
