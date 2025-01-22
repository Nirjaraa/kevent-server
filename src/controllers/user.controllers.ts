import { errorHandler } from "../utils/error-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.model";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { Request, Response } from "express";
import { sendEmail, sendOtp, verifyEmails } from "../utils/sendEmail";
import Ticket from "../models/ticket.model";
import Event from "../models/event.model";
const { v4: uuidv4 } = require("uuid");

//SIGNUP
const registerUsers = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, batch, department, year, avatarURL } = req.body;
    if (!firstName || !lastName || !email || !password || !batch || !department || !year) {
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

    const userWithoutPassword = await User.findById(newUser._id).select("-password -createdAt -updatedAt -verificationCode -emailVerified");

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
    const { email, currentPassword, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).send("Current password is incorrect");
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

//GET PROFILE
const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user;

    if (!isValidObjectId(userId)) {
      return res.status(404).json({ error: "Invalid Id" });
    }

    const user = await User.findById(userId).select("-password -createdAt -resetPasswordOtp -resetPasswordOtpExpires -updatedAt -emailVerified -verificationCode");
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    return res.status(200).json({ message: "User Retrived Sucessfully", user });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//UPDATE PROFILE
const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user;

    const { firstName, lastName, password, batch, department, year, avatarURL } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, password, batch, department, year, avatarURL },
      { new: true, runValidators: true } // Return updated document and validate
    ).select(" -createdAt -resetPasswordOtp -resetPasswordOtpExpires -updatedAt -emailVerified -verificationCode");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Your profile has been updated", user });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//VIEW TICKETS BY ID
const viewTickets = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    const tickets = await Ticket.find({
      userId,
    })
      .populate("eventId", "Title date Venue mainImage")
      .lean();

    if (!tickets.length) {
      return res.status(404).json({ message: "No upcoming events found." });
    }

    return res.status(200).json({ tickets });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

//VIEW EVENT IN PROFILE
const viewEventsById = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    const events = await Event.find(
      {
        userId,
        date: { $gte: currentDate },
      },
      "Title date Venue mainImage"
    ).lean();

    if (!events.length) {
      return res.status(404).json({ message: "No upcoming events found." });
    }

    return res.status(200).json({ events });
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

//UPLOAD IMAGES
const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    // Retrieve the uploaded avatar URL from Cloudinary
    const avatarURL = req.file?.path;

    // Update user's avatar URL in the database
    const user = await User.findByIdAndUpdate(req.user.id, { avatarURL }, { new: true });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).json({
      message: "Avatar uploaded successfully!",
      avatarURL: user.avatarURL, // Send the updated avatar URL as response
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Something went wrong." });
  }
};

const expiredTickets = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const currentDate = new Date();
    console.log(currentDate);
    console.log(userId);

    const tickets = await Ticket.find({ userId: userId });

    if (!tickets.length) {
      console.log("No tickets found for this user");
    }

    // Use Promise.all to fetch event details for each ticket
    const ticketsWithEventDetails = await Promise.all(
      tickets.map(async (ticket) => {
        const event = await Event.findById(ticket.eventId); // Get event by eventId
        if (event) {
          // Attach event date to the ticket
          return { ...ticket.toObject(), eventDate: event.date, Title: event.Title, Venue: event.Venue };
        }
        return null;
      })
    );

    // Filter tickets where the event date is in the past
    const expiredTickets = ticketsWithEventDetails.filter((ticket) => ticket && new Date(ticket.eventDate) < currentDate);

    return res.status(200).json({
      success: true,
      message: "Expired tickets retrieved successfully",
      data: expiredTickets,
    });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

const expiredEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user;
    const currentDate = new Date();

    const expiredEvents = await Event.find({
      userId: userId,
      date: { $lt: currentDate },
    });

    if (expiredEvents.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No expired events found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expired events retrieved successfully",
      data: expiredEvents,
    });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};
const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("User found:", user);

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

const verifyResetOtp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified" });
  } catch (error) {
    const errorMessage = errorHandler(error as Error);
    return res.status(500).json({ error: errorMessage });
  }
};

export {
  expiredEvents,
  expiredTickets,
  registerUsers,
  login,
  forgotPassword,
  changePassword,
  updateProfile,
  verifyEmail,
  resendOtp,
  resetPassword,
  getProfile,
  viewTickets,
  viewEventsById,
  uploadAvatar,
  verifyResetOtp,
};
