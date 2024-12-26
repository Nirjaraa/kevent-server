import { Router } from "express";
const router: Router = Router();
import { googleCallback, loginWithGoogle } from "../oAuth/oAuth";

router.get("/auth/google", loginWithGoogle);
router.get("/auth/google/callback", googleCallback);
export default router;
