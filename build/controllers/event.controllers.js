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
exports.searchEvents = exports.viewAnEvent = exports.viewAllEvents = exports.deleteEvent = exports.updateEvent = exports.createEvent = void 0;
var error_handler_1 = require("../utils/error-handler");
var event_model_1 = __importDefault(require("../models/event.model"));
//CREATE EVENT
var createEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, Title, Description, contactNumber, Venue, date, Price, Files, Images, mainImage, existingEvent, creatingEvent, error_1, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, Title = _a.Title, Description = _a.Description, contactNumber = _a.contactNumber, Venue = _a.Venue, date = _a.date, Price = _a.Price, Files = _a.Files, Images = _a.Images, mainImage = _a.mainImage;
                if (!Title || !Description || !contactNumber || !Venue || !date || !Price || !mainImage) {
                    return [2 /*return*/, res.status(400).json({ error: ":Please add all the fields." })];
                }
                return [4 /*yield*/, event_model_1.default.findOne({ Title: Title, Date: Date })];
            case 1:
                existingEvent = _b.sent();
                if (existingEvent) {
                    return [2 /*return*/, res.status(400).json({ error: "An event with the same title and date already exists." })];
                }
                return [4 /*yield*/, event_model_1.default.create({
                        Title: Title,
                        Description: Description,
                        contactNumber: contactNumber,
                        Venue: Venue,
                        date: date,
                        Price: Price,
                        Files: Files,
                        Images: Images,
                        mainImage: mainImage,
                    })];
            case 2:
                creatingEvent = _b.sent();
                return [2 /*return*/, res.status(201).json({ message: "Event created successfully." })];
            case 3:
                error_1 = _b.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_1);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.createEvent = createEvent;
//UPDATE EVENT
var updateEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, _a, Title, Description, contactNumber, Venue, date, Price, Images, Files, mainImage, updatedEvent, error_2, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                eventId = req.params.id;
                _a = req.body, Title = _a.Title, Description = _a.Description, contactNumber = _a.contactNumber, Venue = _a.Venue, date = _a.date, Price = _a.Price, Images = _a.Images, Files = _a.Files, mainImage = _a.mainImage;
                return [4 /*yield*/, event_model_1.default.findByIdAndUpdate(eventId, { Title: Title, Description: Description, contactNumber: contactNumber, Venue: Venue, date: date, Price: Price, Images: Images, Files: Files, mainImage: mainImage }, { new: true })];
            case 1:
                updatedEvent = _b.sent();
                if (!updatedEvent) {
                    return [2 /*return*/, res.status(404).json({ error: "Event was not updated." })];
                }
                return [2 /*return*/, res.status(200).json({ message: "Appointment updated successfully." })];
            case 2:
                error_2 = _b.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_2);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateEvent = updateEvent;
//DELETE EVENT
var deleteEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, deletedEvent, error_3, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                eventId = req.params.id;
                return [4 /*yield*/, event_model_1.default.findByIdAndDelete(eventId)];
            case 1:
                deletedEvent = _a.sent();
                if (!deletedEvent) {
                    return [2 /*return*/, res.status(404).json({ error: "Event not found." })];
                }
                return [2 /*return*/, res.status(200).json({ message: "Event deleted successfully." })];
            case 2:
                error_3 = _a.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_3);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteEvent = deleteEvent;
//VIEW ALL EVENTS(FEED IG)
var viewAllEvents = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var today, events, error_4, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                today = new Date();
                today.setHours(0, 0, 0, 0);
                return [4 /*yield*/, event_model_1.default.find({ date: { $gte: today } }, "-createdAt -updatedAt").sort({ date: 1 })];
            case 1:
                events = _a.sent();
                return [2 /*return*/, res.status(200).json({ message: "Events:", events: events })];
            case 2:
                error_4 = _a.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_4);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.viewAllEvents = viewAllEvents;
//VIEW A PARTICULAR EVENT
var viewAnEvent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var eventId, event_1, error_5, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                eventId = req.params.id;
                return [4 /*yield*/, event_model_1.default.findById(eventId, "-createdAt -updatedAt")];
            case 1:
                event_1 = _a.sent();
                if (!event_1) {
                    return [2 /*return*/, res.status(404).json({ message: "Event not found" })];
                }
                return [2 /*return*/, res.status(200).json({ message: "Event details:", event: event_1 })];
            case 2:
                error_5 = _a.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_5);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.viewAnEvent = viewAnEvent;
//SEARCH EVENTS
var searchEvents = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var search, regex, eventExists, error_6, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                search = req.query.search;
                if (!search) {
                    return [2 /*return*/, res.status(400).json({ error: "Please add all fields " })];
                }
                regex = new RegExp(search.toString(), "i");
                return [4 /*yield*/, event_model_1.default.find({
                        $or: [{ department: regex }, { Title: regex }],
                    }).sort({ date: -1 })];
            case 1:
                eventExists = _a.sent();
                if (!eventExists.length) {
                    return [2 /*return*/, res.status(400).json({ error: "Event doesn't exist" })];
                }
                return [2 /*return*/, res.status(201).json({ message: "Search Successful", event: eventExists })];
            case 2:
                error_6 = _a.sent();
                errorMessage = (0, error_handler_1.errorHandler)(error_6);
                return [2 /*return*/, res.status(500).json({ error: errorMessage })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.searchEvents = searchEvents;
