import express, { Request, Response } from "express";
const router = express.Router();

// Render a simple HTML page with a login button
router.get("/", (req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>Login Page</title>
      </head>
      <body>
        <h1>Welcome to the Login Page</h1>
        <button id="loginButton">Login</button>

        <script>
          document.getElementById('loginButton').addEventListener('click', () => {
            // Redirect to the OAuth login route (replace /auth/google with your route)
            window.location.href = '/auth/google';
          });
        </script>
      </body>
    </html>
  `);
});

export default router;
