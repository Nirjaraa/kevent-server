"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = (0, express_1.Router)();
var user_controllers_1 = require("../controllers/user.controllers");
router.post("/register", user_controllers_1.registerUsers);
router.post("/login", user_controllers_1.login);
exports.default = router;
