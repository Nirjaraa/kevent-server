import { Router } from "express";
const router: Router = Router();
import { googleCallback, loginWithGoogle } from "../oAuth/oAuth";

router.get("/auth/google", loginWithGoogle); // Redirect to Google OAuth
router.get("/auth/google/callback", googleCallback); // Handle OAuth Callback
export default router;
