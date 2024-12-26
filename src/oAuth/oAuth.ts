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

// Handle Google OAuth callback and save user to DB
export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  try {
    // Step 1: Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Step 2: Fetch user info from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const { id, email, name, picture, verified_email } = data;

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
        year: "",
        googleId: id,
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
    res.cookie("auth_token", token, { httpOnly: true, maxAge: 10 * 60 * 1000 });
    res.send(`
      <html>
        <body>
          <script>
            // Ensure the message is only sent to the parent window
            if (window.opener) {
              window.opener.postMessage({ token: "${token}" }, "http://localhost:3001");
            }
            window.close(); // Close the popup window after sending the message
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Error during Google OAuth callback:", error.message);
    res.status(500).json({ message: "Google Authentication Failed" });
  }
};

// Handle Google OAuth callback and save user to DB
// export const googleLogin = async (req: Request, res: Response) => {
//   const code = req.query.code as string;

//   try {
//     // Step 1: Exchange code for tokens
//     const { tokens } = await oauth2Client.getToken(code);
//     oauth2Client.setCredentials(tokens);

//     // Step 2: Fetch user info from Google
//     const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
//     const { data } = await oauth2.userinfo.get();

//     const { id } = data;

//     const generateToken = (id: string) => {
//       return jwt.sign({ id }, process.env.JWT_SECRET as string, {
//         expiresIn: "3h",
//       });
//     };

//     return res.status(201).json({ message: "Register  Successful", token: generateToken(user.id), user });
//   } catch (error: any) {
//     console.error("Error during Google OAuth callback:", error.message);
//     res.status(500).json({ message: "Google Authentication Failed" });
//   }
// };
