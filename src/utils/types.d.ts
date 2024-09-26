import { IUser } from "./models/User.model"; // Import IUser type

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null; // Use IUser instead of User
    }
  }
}
