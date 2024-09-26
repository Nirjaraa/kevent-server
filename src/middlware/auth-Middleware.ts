import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";

const isUser = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check if the authorization header contains a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract the token from the authorization header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token and decode the user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as { id: string };

      // Fetch the user from the database, excluding the password field
      const user = await User.findById(decoded.id).select("-password");

      // If user is not found, respond with a 404 error
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Assign the found user to req.user
      req.user = user;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(error); // Log the error for debugging purposes
      return res.status(401).json({ error: "Not Authorized" });
    }
  } else {
    // If token is not found, respond with a 401 error
    return res.status(401).json({ error: "Token not found" });
  }
};

export { isUser };
