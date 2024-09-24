"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var connectDB_1 = __importDefault(require("./db/connectDB"));
var user_route_1 = __importDefault(require("./routes/user.route"));
dotenv_1.default.config();
(0, connectDB_1.default)();
var app = (0, express_1.default)();
app.use(express_1.default.json());
var port = process.env.PORT || 3000;
app.get("/", function (req, res) {
    res.send("Welcome to the port 3000");
});
app.use("/users", user_route_1.default);
app.listen(port, function () {
    console.log("Connected successfully on port ".concat(port));
});
