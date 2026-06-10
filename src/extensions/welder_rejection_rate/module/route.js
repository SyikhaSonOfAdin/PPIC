"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("../../../middlewares/jwt");
const express_1 = require("express");
const controller_1 = __importDefault(require("./controller"));
const welderRejectionRateRoute = (0, express_1.Router)();
welderRejectionRateRoute.get("/overall/:project_id", jwt_1.jwtServices.verifyToken.byHeader, 
// @ts-ignore
controller_1.default.getOverall);
welderRejectionRateRoute.post("/access", jwt_1.jwtServices.verifyToken.byHeader, 
// @ts-ignore
controller_1.default.access);
exports.default = welderRejectionRateRoute;
