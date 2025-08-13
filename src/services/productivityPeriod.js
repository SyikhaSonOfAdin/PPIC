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
exports.productivityPeriodServices = void 0;
var productivityPeriod_1 = require("../models/productivityPeriod");
var others_1 = require("../models/others");
var db_1 = require("../config/db");
var uuid_1 = require("uuid");
/**
 * Get the next or same date on/after `date` matching `targetDay` (0=Sunday...6=Saturday).
 */
function getNextOrSame(date, targetDay) {
    var d = new Date(date);
    var current = d.getDay();
    var delta = (targetDay - current + 7) % 7;
    d.setDate(d.getDate() + delta);
    return d;
}
/**
 * Get the previous or same date on/before `date` matching `targetDay` (0=Sunday...6=Saturday).
 */
function getPrevOrSame(date, targetDay) {
    var d = new Date(date);
    var current = d.getDay();
    var delta = (current - targetDay + 7) % 7;
    d.setDate(d.getDate() - delta);
    return d;
}
exports.productivityPeriodServices = {
    add: {
        automatically: function (companyId, startWeekdayValue, // 1=Sunday...7=Saturday (from user)
        finishWeekdayValue, // 1=Sunday...7=Saturday (from user)
        intervalDays, // number >= 1
        connection) { return __awaiter(void 0, void 0, void 0, function () {
            var conn, _a, earliestRows, latestRows, rawStart, rawEnd, jsStart, jsEnd, periodStart, lastPossibleEnd, periods, insertTasks, id, actualEnd, record, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = connection;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.PPIC.getConnection()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        conn = _a;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, 8, 9]);
                        return [4 /*yield*/, conn.query(others_1.othersQuerys.select.project.start_date.earliest, [companyId])];
                    case 4:
                        earliestRows = (_b.sent())[0];
                        return [4 /*yield*/, conn.query(others_1.othersQuerys.select.project.due_date.latest, [companyId])];
                    case 5:
                        latestRows = (_b.sent())[0];
                        if (!earliestRows.length || !latestRows.length) {
                            throw new Error("No projects found for company");
                        }
                        rawStart = new Date(earliestRows[0].START_DATE);
                        rawEnd = new Date(latestRows[0].DUE_DATE);
                        jsStart = startWeekdayValue % 7;
                        jsEnd = finishWeekdayValue % 7;
                        periodStart = getPrevOrSame(rawStart, jsStart);
                        lastPossibleEnd = getNextOrSame(rawEnd, jsEnd);
                        periods = [];
                        insertTasks = [];
                        while (periodStart <= lastPossibleEnd) {
                            id = (0, uuid_1.v7)();
                            actualEnd = new Date(periodStart.getTime() + (intervalDays - 1) * 24 * 60 * 60 * 1000);
                            insertTasks.push(conn.query(productivityPeriod_1.productivityPeriodQuerys.insert, [
                                id,
                                companyId,
                                periodStart.toISOString().slice(0, 10),
                                actualEnd.toISOString().slice(0, 10),
                            ]));
                            record = {
                                id: id,
                                company_id: companyId,
                                start_date: periodStart.toISOString().slice(0, 10),
                                end_date: actualEnd.toISOString().slice(0, 10),
                            };
                            periods.push(record);
                            periodStart = new Date(actualEnd.getTime() + 1 * 24 * 60 * 60 * 1000);
                        }
                        return [4 /*yield*/, Promise.all(insertTasks)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, periods];
                    case 7:
                        error_1 = _b.sent();
                        throw error_1;
                    case 8:
                        if (!connection) {
                            conn.release();
                        }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        }); },
    },
    get: {
        by: {
            companyId: function (companyId, connection) { return __awaiter(void 0, void 0, void 0, function () {
                var conn, _a, rows, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = connection;
                            if (_a) return [3 /*break*/, 2];
                            return [4 /*yield*/, db_1.PPIC.getConnection()];
                        case 1:
                            _a = (_b.sent());
                            _b.label = 2;
                        case 2:
                            conn = _a;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, 6, 7]);
                            return [4 /*yield*/, conn.query(productivityPeriod_1.productivityPeriodQuerys.select.all, [companyId])];
                        case 4:
                            rows = (_b.sent())[0];
                            return [2 /*return*/, rows.map(function (row) { return ({
                                    ID: row.ID,
                                    COMPANY_ID: row.COMPANY_ID,
                                    CUTOFF_DATE_START: row.CUTOFF_DATE_START,
                                    CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
                                }); })];
                        case 5:
                            error_2 = _b.sent();
                            throw error_2;
                        case 6:
                            if (!connection) {
                                conn.release();
                            }
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            }); },
            period: function (companyId, startDate, endDate, connection) { return __awaiter(void 0, void 0, void 0, function () {
                var conn, _a, rows, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = connection;
                            if (_a) return [3 /*break*/, 2];
                            return [4 /*yield*/, db_1.PPIC.getConnection()];
                        case 1:
                            _a = (_b.sent());
                            _b.label = 2;
                        case 2:
                            conn = _a;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, 6, 7]);
                            return [4 /*yield*/, conn.query(productivityPeriod_1.productivityPeriodQuerys.select.period, [endDate, startDate, companyId])];
                        case 4:
                            rows = (_b.sent())[0];
                            return [2 /*return*/, rows.map(function (row) { return ({
                                    ID: row.ID,
                                    COMPANY_ID: row.COMPANY_ID,
                                    CUTOFF_DATE_START: row.CUTOFF_DATE_START,
                                    CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
                                }); })];
                        case 5:
                            error_3 = _b.sent();
                            throw error_3;
                        case 6:
                            if (!connection) {
                                conn.release();
                            }
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            }); },
        },
    },
};
