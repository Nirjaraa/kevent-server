import { Router } from "express";
import passport from "../middlware/auth"; // Ensure this path is correct

const router: Router = Router();

// OAuth login route
router.get(
  "/auth/google",
  passport.authenticate("oauth2", {
    scope: ["profile", "email"], // Specify scopes here
  })
);

// OAuth callback route
router.get("/auth/google/callback",
   passport.authenticate("oauth2", { failureRedirect: "/auth/failure" }), (req, res) => {
  // On successful authentication
  res.json({
    message: "Authentication successful",
    user: req.user, // The authenticated user's data
  });
});

// Failure route for testing
router.get("/auth/failure", (req, res) => {
  res.status(401).json({ message: "Authentication failed" });
});

export default router;
