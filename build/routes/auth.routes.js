"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_1 = __importDefault(require("../middlware/auth")); // Ensure this path is correct
var router = (0, express_1.Router)();
// OAuth login route
router.get("/auth/google", auth_1.default.authenticate("oauth2", {
    scope: ["profile", "email"], // Specify scopes here
}));
// OAuth callback route
router.get("/auth/google/callback", auth_1.default.authenticate("oauth2", { failureRedirect: "/auth/failure" }), function (req, res) {
    // On successful authentication
    res.json({
        message: "Authentication successful",
        user: req.user, // The authenticated user's data
    });
});
// Failure route for testing
router.get("/auth/failure", function (req, res) {
    res.status(401).json({ message: "Authentication failed" });
});
exports.default = router;
