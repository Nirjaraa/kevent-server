"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendOtp = exports.verifyEmail = exports.viewTickets = exports.updateProfile = exports.changePassword = exports.forgotPassword = exports.login = exports.registerUsers = void 0;
var error_handler_1 = require("../utils/error-handler");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var User_model_1 = __importDefault(require("../models/User.model"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var sendEmail_1 = require("../utils/sendEmail");
var ticket_model_1 = __importDefault(require("../models/ticket.model"));
var uuidv4 = require("uuid").v4;
//SIGNUP
var registerUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, firstName, lastName, email, password, batch, department, avatarURL, userExists, salt, hashedPassword, verificationCode, newUser, emailText, subject, userWithoutPassword, error_1, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                _a = req.body, firstName = _a.firstName, lastName = _a.lastName, email = _a.email, password = _a.password, batch = _a.batch, department = _a.department, avatarURL = _a.avatarURL;
                if (!firstName || !lastName || !email || !password || !batch || !department) {
                    return [2 /*return*/, res.status(400).json({ error: ":Please add all the fields." })];
                }
                return [4 /*yield*/, User_model_1.default.findOne({ email: email })];
            case 1:
                userExists = _b.sent();
                if (userExists) {
                    return [2 /*return*/, res.status(400).json({ error: "User already exists" })];
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(password, salt)];
            case 3:
                hashedPassword = _b.sent();
                verificationCode = generateVerificationCode();
                return [4 /*yield*/, User_model_1.default.create({
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email.trim(),
                        password: hashedPassword,
                        batch: batch,
                        department: department,
                        verificationCode: verificationCode,
                        emailVerified: false,
                    })];
            case 4:
                newUser = _b.sent();
                emailText = (0, sendEmail_1.verifyEmails)(newUser.firstName, verificationCode);
                subject = "Email Verification";
                return [4 /*yield*/, (0, sendEmail_1.sendEmail)(email, subject, emailText)];
            case 5:
                _b.sent();
                return [4 /*yield*/, User_model_1.default.findById(newUser._id).select("-password -createdAt -updatedAt verificationCode emailVerified")];
            case 6:
                userWithoutPassword = _b.sent();
                res.status(201).json({ message: "OTP has been sent to your email verify it to register.", user: userWithoutPassword });
                return [3 /*break*/, 8];
            case 7:
                error_1 = _b.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_1);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.registerUsers = registerUsers;
var generateVerificationCode = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
//VERIFY EMAIL
var verifyEmail = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, verificationCode, user, error_2, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, verificationCode = _a.verificationCode;
                return [4 /*yield*/, User_model_1.default.findOne({ email: email, verificationCode: verificationCode })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({ error: "Invalid verification code." })];
                }
                user.emailVerified = true;
                return [4 /*yield*/, user.save()];
            case 2:
                _b.sent();
                return [2 /*return*/, res.status(200).json({ message: "Email verified successfully." })];
            case 3:
                error_2 = _b.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_2);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.verifyEmail = verifyEmail;
//LOGIN
var generateToken = function (id) {
    return jsonwebtoken_1.default.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: "3h",
    });
};
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, _b, error_3, errorMessage;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, User_model_1.default.findOne({ email: email })];
            case 1:
                user = _c.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                }
                if (!user.emailVerified) {
                    return [2 /*return*/, res.status(403).json({ error: "Email not verified. Please verify your email before logging in." })];
                }
                _b = user;
                if (!_b) return [3 /*break*/, 3];
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
            case 2:
                _b = (_c.sent());
                _c.label = 3;
            case 3:
                if (_b) {
                    return [2 /*return*/, res.status(201).json({ message: "Login Successful", token: generateToken(user.id), user: user })];
                }
                return [2 /*return*/, res.status(404).json({ error: "Invalid Email and Password" })];
            case 4:
                error_3 = _c.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_3);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
//FORGOT-PASSWORD
var forgotPassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, otp, emailText, subject, error_4, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                email = req.body.email;
                return [4 /*yield*/, User_model_1.default.findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).send("User not found")];
                }
                otp = uuidv4().slice(0, 6);
                user.resetPasswordOtp = otp;
                user.resetPasswordOtpExpires = new Date(Date.now() + 300000);
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                emailText = (0, sendEmail_1.sendOtp)(user.firstName, otp);
                subject = "Verification code";
                return [4 /*yield*/, (0, sendEmail_1.sendEmail)(user.email, subject, emailText)];
            case 3:
                _a.sent();
                return [2 /*return*/, res.status(200).json({ message: "OTP sent to email" })];
            case 4:
                error_4 = _a.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_4);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.forgotPassword = forgotPassword;
//CHANGE PASSWORD
var changePassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, salt, hashedPassword, error_5, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, User_model_1.default.findOne({ email: email })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).send("User not found")];
                }
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(password, salt)];
            case 3:
                hashedPassword = _b.sent();
                user.password = hashedPassword;
                return [4 /*yield*/, user.save()];
            case 4:
                _b.sent();
                res.status(200).send("Password changed successfully");
                return [3 /*break*/, 6];
            case 5:
                error_5 = _b.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_5);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.changePassword = changePassword;
//UPDATE PROFILE
var updateProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, firstName, lastName, email, password, batch, department, avatarURL, user, error_6, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.params.id;
                _a = req.body, firstName = _a.firstName, lastName = _a.lastName, email = _a.email, password = _a.password, batch = _a.batch, department = _a.department, avatarURL = _a.avatarURL;
                return [4 /*yield*/, User_model_1.default.findByIdAndUpdate(userId, { firstName: firstName, lastName: lastName, email: email, password: password, batch: batch, department: department, avatarURL: avatarURL }, { new: true, runValidators: true } // Return updated document and validate
                    ).select("-password -createdAt -resetPasswordOtp -resetPasswordOtpExpires -updatedAt")];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                }
                return [2 /*return*/, res.status(200).json({ message: "Your profile has been updated", user: user })];
            case 2:
                error_6 = _b.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_6);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateProfile = updateProfile;
var viewTickets = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, tickets, error_7, errorMessage;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, ticket_model_1.default.find({ userId: userId })];
            case 1:
                tickets = _b.sent();
                if (!tickets || tickets.length === 0) {
                    return [2 /*return*/, res.status(404).json({ error: "No tickets found" })];
                }
                return [2 /*return*/, res.status(200).json({ message: "Tickets found successfully", tickets: tickets })];
            case 2:
                error_7 = _b.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_7);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.viewTickets = viewTickets;
//RESEND OTP
var resendOtp = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, otp, emailText, subject, error_8, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                email = req.body.email;
                return [4 /*yield*/, User_model_1.default.findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                }
                otp = uuidv4().slice(0, 6);
                user.resetPasswordOtp = otp;
                user.resetPasswordOtpExpires = new Date(Date.now() + 300000);
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                emailText = (0, sendEmail_1.sendOtp)(user.firstName, otp);
                subject = "New OTP for Verification";
                return [4 /*yield*/, (0, sendEmail_1.sendEmail)(user.email, subject, emailText)];
            case 3:
                _a.sent();
                return [2 /*return*/, res.status(200).json({ message: "New OTP sent to your email" })];
            case 4:
                error_8 = _a.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_8);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.resendOtp = resendOtp;
