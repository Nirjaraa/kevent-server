"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var connectDB_1 = __importDefault(require("./db/connectDB"));
var user_route_1 = __importDefault(require("./routes/user.route"));
var event_route_1 = __importDefault(require("./routes/event.route"));
var ticket_route_1 = __importDefault(require("./routes/ticket.route"));
var auth_routes_1 = __importDefault(require("./routes/auth.routes")); // Ensure this import is correct
var passport_1 = __importDefault(require("passport"));
var express_session_1 = __importDefault(require("express-session"));
var cors_1 = __importDefault(require("cors"));
var User_model_1 = __importDefault(require("./models/User.model"));
dotenv_1.default.config();
(0, connectDB_1.default)();
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
// Enable CORS preflight handling
app.options('*', (0, cors_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.EXAMPLE_CLIENT_SECRET || "default_secret_key",
    resave: false,
    saveUninitialized: true,
}));
// Initialize Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Use routes
app.use("/users", user_route_1.default);
app.use("/events", event_route_1.default);
app.use("/tickets", ticket_route_1.default);
app.use(auth_routes_1.default); // Ensure that the auth routes are added here
var port = process.env.PORT || 3000;
app.get("/", function (req, res) {
    res.send("Welcome to the port 3000");
});
app.post('/users/register', function (req, res) {
    User_model_1.default.create(req.body)
        .then(function (User) {
        res.status(201).json(User);
    })
        .catch(function (error) {
        res.status(400).json(error);
    });
});
app.listen(port, function () {
    console.log("Connected successfully on port ".concat(port));
});
