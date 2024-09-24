import express from "express";

declare global {
  namespace Express {
    interface Request {
      user: IUser; // Custom property
      // You can add more custom properties here
    }
  }
}
