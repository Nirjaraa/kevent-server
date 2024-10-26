import { Router } from "express";
const router: Router = Router();
import { registerUsers, login, forgotPassword, changePassword, updateProfile, viewTickets, verifyEmail, resendOtp, getProfile } from "../controllers/user.controllers";
import { isUser } from "../middlware/auth-Middleware";

router.post("/register", registerUsers);
router.post("/login", login);
router.post("/verifyemail", verifyEmail);
router.post("/resendOTP", resendOtp);
router.post("/forgot-password", isUser, forgotPassword);
router.post("/change-password", isUser, changePassword);
router.get("/profile", isUser, getProfile);
router.put("/update-profile", isUser, updateProfile);
router.get("/viewtickets", isUser, viewTickets);

// router.get("/events/:eventId/attendees/export", isUser, exportAttendeesToCSV);

export default router;
