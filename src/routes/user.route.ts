import { Router } from "express";
const router: Router = Router();
import { registerUsers, login, forgotPassword, changePassword, updateProfile } from "../controllers/user.controllers";
import { isUser } from "../middlware/auth-Middleware";

router.post("/register", registerUsers);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("change-password", changePassword);
router.put("/update-profile/:id", isUser, updateProfile);

export default router;
