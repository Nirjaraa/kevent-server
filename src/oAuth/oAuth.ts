import { google } from "googleapis";
import User from "../models/User.model";
import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const REDIRECT_URI = process.env.REDIRECT_URI as string;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Generate Google OAuth URL
export const loginWithGoogle = (req: Request, res: Response) => {
  console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
  console.log("Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
  console.log("Redirect URI:", process.env.REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
  });
  res.redirect(authUrl);
};

// Handle Google OAuth callback and save user to DB
export const googleCallback = async (req: Request, res: Response) => {
  console.log("Client ID 1:", process.env.GOOGLE_CLIENT_ID);
  console.log("Client Secret 2:", process.env.GOOGLE_CLIENT_SECRET);
  console.log("Redirect URI 3:", process.env.REDIRECT_URI);

  const code = req.query.code as string;

  try {
    // Step 1: Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Step 2: Fetch user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const { email, name, picture, verified_email } = data;

    // Extract first name and last name from the full name
    const [firstName, ...lastNameArray] = name?.split(" ") || [];
    const lastName = lastNameArray.join(" ");

    // Step 3: Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Step 4: Create a new user if they don't exist
      user = new User({
        firstName: firstName || "Unknown",
        lastName: lastName || "User",
        email: email,
        avatarURL: picture,
        emailVerified: verified_email,
        provider: "google",
        batch: "",
        department: "",
        year: "", // Default value (update if needed)
      });

      await user.save();
      console.log("New user created via Google OAuth:", user);
    } else {
      console.log("Existing user logged in via Google OAuth:", user);
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.firstName + " " + user.lastName }, // Payload
      process.env.JWT_SECRET as string, // Your JWT secret (directly use the environment variable)
      { expiresIn: "3h" } // Expiration time (3 hours in this case)
    );

    // Step 6: Respond with the JWT token and user details
    res.json({
      success: true,
      message: "Google Sign-in Successful",
      token, // Include the JWT token in the response
      user, // Optionally include user details (for frontend)
    });
  } catch (error: any) {
    console.error("Error during Google OAuth callback:", error.message);
    res.status(500).json({ message: "Google Authentication Failed" });
  }
};
