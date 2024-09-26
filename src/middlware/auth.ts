import passport from "passport";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import User from "../models/User.model"; // Ensure this path is correct
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://accounts.google.com/o/oauth2/auth",
      tokenURL: "https://accounts.google.com/o/oauth2/token",
      clientID: process.env.EXAMPLE_CLIENT_ID || "defaultClientID",
      clientSecret: process.env.EXAMPLE_CLIENT_SECRET || "defaultClientSecret",
      callbackURL: "http://localhost:3000/auth/google/callback",
      scope: ["email", "profile"], // Ensure you have the right scopes
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        console.log("Profile data:", profile); // Log the profile data

        // Extract necessary information from the profile object
        const firstName = profile.name.givenName || "";
        const lastName = profile.name.familyName || "";
        const email = profile.emails[0].value || "";
        const exampleId = profile.id; // Google ID

        // Find or create user in the database
        const user = await User.findOneAndUpdate(
          { email }, // Find user by email
          {
            firstName,
            lastName,
            email,
            exampleId, // Optional if you want to store Google ID
          },
          { upsert: true, new: true } // Create user if not found
        );

        return done(null, user); // Pass user to the next middleware
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
