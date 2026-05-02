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
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressPercentage = void 0;
var projectDetail_1 = require("../services/projectDetail");
var projectActual_1 = require("../services/projectActual");
var projectPlans_1 = require("../services/projectPlans");
var db_1 = require("../config/db");
var progressPercentage = function (projectId, conn) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, _a, _b, projectDetail, actualData, plans, currActual, currPlan, tempActual, tempPlans, percentage, deviation, actual, error_1;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = conn;
                if (_a) return [3 /*break*/, 2];
                return [4 /*yield*/, db_1.PPIC.getConnection()];
            case 1:
                _a = (_e.sent());
                _e.label = 2;
            case 2:
                connection = _a;
                _e.label = 3;
            case 3:
                _e.trys.push([3, 5, 6, 7]);
                return [4 /*yield*/, Promise.all([
                        projectDetail_1.projectDetailServices.get(projectId, connection),
                        projectActual_1.actualServices.get.all(projectId, connection),
                        projectPlans_1.plansServices.get.all(projectId, connection),
                    ])];
            case 4:
                _b = _e.sent(), projectDetail = _b[0], actualData = _b[1], plans = _b[2];
                currActual = actualData
                    .filter(function (p) { return new Date("".concat(p.PERIOD_YEAR, "-").concat(p.PERIOD_MONTH)) <= new Date(); })
                    .reduce(function (total, item) { return total + Number(item.PERCENTAGE); }, 0);
                currPlan = plans
                    .filter(function (p) { return new Date("".concat(p.PERIOD_YEAR, "-").concat(p.PERIOD_MONTH)) <= new Date(); })
                    .reduce(function (total, item) { return total + Number(item.PERCENTAGE); }, 0);
                tempActual = actualData.reduce(function (sum, item) { return sum + Number(item.AMOUNT); }, 0);
                tempPlans = Number((_d = (_c = plans[plans.length - 1]) === null || _c === void 0 ? void 0 : _c.AMOUNT) !== null && _d !== void 0 ? _d : 0);
                percentage = tempActual > 0 ? (tempActual / Number(projectDetail.CAPACITY)) * 100 : 0;
                deviation = (currActual - currPlan).toFixed(2);
                actual = "".concat(new Intl.NumberFormat("id-ID").format(tempPlans), " / ").concat(new Intl.NumberFormat("id-ID").format(tempActual));
                return [2 /*return*/, {
                        percentage: percentage,
                        deviation: deviation,
                        actual: actual,
                        actualProgress: tempActual,
                        actualPlans: tempPlans,
                    }];
            case 5:
                error_1 = _e.sent();
                throw error_1;
            case 6:
                if (!conn) {
                    connection.release();
                }
                return [7 /*endfinally*/];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.progressPercentage = progressPercentage;
