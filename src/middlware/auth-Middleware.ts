import { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { IUser } from "../interface/User.interface";

const isUser = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as jwt.Secret) as { id: string };
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      req.user = user as IUser;

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ error: "Not Authorized" });
    }
  } else {
    return res.status(401).json({ error: "Token not found" });
  }
};

export { isUser };
