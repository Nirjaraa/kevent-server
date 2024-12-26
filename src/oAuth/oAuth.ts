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
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
  });
  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    // Step 1: Exchange the code for access tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    console.log(tokens);

    res.send(`
      <script>
        // Send the token to the opener window
        window.opener.postMessage({ access_token: "${tokens.access_token}" }, "http://localhost:3001");
        window.close();
      </script>
    `);
  } catch (error: any) {
    console.error("Error during Google OAuth callback:", error.message);
    res.status(500).json({ message: "Google Authentication Failed" });
  }
};

export const signupWithGoogle = async (req: Request, res: Response) => {
  const { access_token } = req.body;
  if (!access_token || typeof access_token !== "string") {
    return res.status(400).json({ message: "Access token is required and should be a string" });
  }
  try {
    oauth2Client.setCredentials({ access_token });

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const { id, email, name, picture, verified_email } = data;

    const [firstName, ...lastNameArray] = name?.split(" ") || [];
    const lastName = lastNameArray.join(" ");

    let user = await User.findOne({ email });
    let userByEmail = await User.findOne({ email });
    let userByGoogleId = await User.findOne({ googleId: id });

    if (userByEmail && userByEmail.googleId !== id) {
      return res.status(400).json({ message: "This email is already associated with a different account." });
    }

    if (userByGoogleId) {
      return res.status(400).json({ message: "Account already exists with this Google ID" });
    }
    if (!user) {
      user = new User({
        firstName: firstName || "Unknown",
        lastName: lastName || "User",
        email: email,
        avatarURL: picture,
        emailVerified: verified_email,
        provider: "google",
        googleId: id,
        batch: "",
        department: "",
        year: "",
      });

      await user.save();
      console.log("New user created via Google OAuth:", user);
    } else {
      console.log("Existing user logged in via Google OAuth:", user);
    }

    const generateToken = (id: string) => {
      return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "3h",
      });
    };

    const token = generateToken(user.id);
    res.cookie("token", token, { httpOnly: true, maxAge: 10 * 60 * 1000 });
    res.status(200).json({ message: "Signup successful", token });
  } catch (error: any) {
    console.error("Error during Google signup:", error.message);
    res.status(500).json({ message: "Google Authentication Failed" });
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const { access_token } = req.body;
  try {
    oauth2Client.setCredentials({ access_token });

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const { id, email } = data;

    let userByEmail = await User.findOne({ email });

    // Check if user already exists by googleId
    let userByGoogleId = await User.findOne({ googleId: id });

    if (userByEmail && userByEmail.googleId !== id) {
      return res.status(400).json({ message: "This email is already associated with a different account." });
    }

    if (!userByGoogleId) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    const generateToken = (id: string) => {
      return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: "3h",
      });
    };

    const token = generateToken(userByGoogleId.id);

    res.status(200).json({ message: "Login successful", token, user: userByGoogleId });
  } catch (error: any) {
    console.error("Error during Google login:", error.message);
    res.status(500).json({ message: "Google Authentication Failed" });
  }
};
