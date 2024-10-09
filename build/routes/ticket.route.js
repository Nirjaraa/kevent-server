"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = (0, express_1.Router)();
var ticket_controllers_1 = require("../controllers/ticket.controllers");
var auth_Middleware_1 = require("../middlware/auth-Middleware");
router.post("/booktickets/:id", auth_Middleware_1.isUser, ticket_controllers_1.bookTickets);
exports.default = router;
