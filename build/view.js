"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var router = express_1.default.Router();
// Render a simple HTML page with a login button
router.get("/", function (req, res) {
    res.send("\n    <html>\n      <head>\n        <title>Login Page</title>\n      </head>\n      <body>\n        <h1>Welcome to the Login Page</h1>\n        <button id=\"loginButton\">Login</button>\n\n        <script>\n          document.getElementById('loginButton').addEventListener('click', () => {\n            // Redirect to the OAuth login route (replace /auth/google with your route)\n            window.location.href = '/auth/google';\n          });\n        </script>\n      </body>\n    </html>\n  ");
});
exports.default = router;
