import { Router } from "express";
const router: Router = Router();
import { signupWithGoogle, loginWithGoogle, googleLogin, googleCallback } from "../oAuth/oAuth";

router.get("/auth/google", loginWithGoogle);
router.get("/auth/google/callback", googleCallback);
router.post("/auth/login", googleLogin);
router.post("/auth/signup", signupWithGoogle);

export default router;
