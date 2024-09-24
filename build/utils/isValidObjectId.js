"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidObjectId = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var isValidObjectId = function (id) {
    // Make sure the length of the id is 24
    // Check if the id is valid
    if (id.length === 24 && mongoose_1.default.isValidObjectId(id)) {
        // Invalid object ids change when converted to ObjectId at different times
        // But valid object ids do not change regardless of the times
        // So create an objectId using the value from the parameter
        var objectIdFromParam = new mongoose_1.default.Types.ObjectId(id);
        // Check if the parameter is the same as the objectId that was just created
        // It has to be converted to string first, otherwise it will always return false
        return objectIdFromParam.toString() === id;
    }
    return false;
};
exports.isValidObjectId = isValidObjectId;
