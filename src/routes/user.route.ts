import { Router } from "express";
const router: Router = Router();
import { registerUsers, login } from "../controllers/user.controllers";

router.post("/register", registerUsers);
router.post("/login", login);

export default router;
