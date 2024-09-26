import { Router } from "express";
const router: Router = Router();
import { registerUsers, login } from "../controllers/user.controllers";
import { isUser } from "../middlware/auth-Middleware";

router.post("/register", registerUsers);
router.post("/login", login);

export default router;
