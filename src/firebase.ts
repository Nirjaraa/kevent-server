import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config();

// Correct path to the service account key
const serviceAccountPath = path.resolve(__dirname, "config", "serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: process.env.FIREBASE_DATABASE_URL, // Optional: Firebase Realtime Database URL
});

export const auth = admin.auth();
