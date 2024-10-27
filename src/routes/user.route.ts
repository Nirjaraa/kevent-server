import { Router } from "express";
const router: Router = Router();
import { registerUsers, login, forgotPassword, changePassword, updateProfile, verifyEmail, viewTickets, resendOtp, getProfile, viewEventsById } from "../controllers/user.controllers";
import { isUser } from "../middlware/auth-Middleware";

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

// router.get("/events/:eventId/attendees/export", isUser, exportAttendeesToCSV);

export default router;
