"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt_1 = require("../../../middlewares/jwt");
var express_1 = require("express");
var controller_1 = require("./controller");
var welderRejectionRateRoute = (0, express_1.Router)();
welderRejectionRateRoute.get("/overall/:project_id", jwt_1.jwtServices.verifyToken.byHeader, 
// @ts-ignore
controller_1.default.getOverall);
welderRejectionRateRoute.post("/access", jwt_1.jwtServices.verifyToken.byHeader, 
// @ts-ignore
controller_1.default.access);
exports.default = welderRejectionRateRoute;
