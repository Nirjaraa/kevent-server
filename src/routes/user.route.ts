import { Router } from "express";
const router: Router = Router();
import {
  registerUsers,
  login,
  forgotPassword,
  changePassword,
  updateProfile,
  verifyEmail,
  viewTickets,
  resendOtp,
  getProfile,
  viewEventsById,
  uploadAvatar,
  expiredEvents,
  expiredTickets,
} from "../controllers/user.controllers";
import { isUser } from "../middlware/auth-Middleware";
import multer from "multer";
import { storage } from "../db/cloudinaryConfig";

const imageUpload = multer({ storage: storage });

router.post("/register", registerUsers);
router.post("/login", login);
router.post("/verifyemail", verifyEmail);
router.post("/resendOTP", resendOtp);
router.post("/forgot-password", isUser, forgotPassword);
router.put("/change-password", isUser, changePassword);
router.get("/profile", isUser, getProfile);
router.put("/update-profile", isUser, updateProfile);
router.get("/viewtickets", isUser, viewTickets);
router.get("/viewevents", isUser, viewEventsById);
router.post("/upload-profileImage", isUser, imageUpload.single("avatar"), uploadAvatar);
router.get("/expiredtickets", isUser, expiredTickets);
router.get("/expiredevents", isUser, expiredEvents);

// router.get("/events/:eventId/attendees/export", isUser, exportAttendeesToCSV);

export default router;
