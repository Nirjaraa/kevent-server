"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var errorHandler = function (err) {
    var errorMessage = err.message ? err.message : "Internal Server Error";
    return errorMessage;
};
exports.errorHandler = errorHandler;
