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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remarkServices = void 0;
var journalRemark_1 = require("../models/journalRemark");
var db_1 = require("../config/db");
var uuid_1 = require("uuid");
exports.remarkServices = {
    add: function (projectId, userId, departmentId, description, deadline, status, solution, connection) { return __awaiter(void 0, void 0, void 0, function () {
        var CONNECTION, _a, id, error_1;
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
                    CONNECTION = _a;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, 6, 7]);
                    id = (0, uuid_1.v7)();
                    return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.insert, [
                            id,
                            projectId,
                            userId,
                            description,
                            solution !== null && solution !== void 0 ? solution : null,
                            deadline,
                            departmentId,
                            status,
                        ])];
                case 4:
                    _b.sent();
                    return [2 /*return*/, id];
                case 5:
                    error_1 = _b.sent();
                    throw error_1;
                case 6:
                    if (!connection && CONNECTION) {
                        CONNECTION.release();
                    }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); },
    delete: {
        all: function (projectId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, error_2;
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
                        CONNECTION = _a;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, 6, 7]);
                        return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.delete.all, [projectId])];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        error_2 = _b.sent();
                        throw error_2;
                    case 6:
                        if (!connection && CONNECTION) {
                            CONNECTION.release();
                        }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); },
        onlyOne: function (remarkId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, error_3;
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
                        CONNECTION = _a;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, 6, 7]);
                        return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.delete.onlyOne, [remarkId])];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        error_3 = _b.sent();
                        throw error_3;
                    case 6:
                        if (!connection && CONNECTION) {
                            CONNECTION.release();
                        }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); },
    },
    edit: function (remarkId, userId, description, deadline, departmentId, status, solution, connection) { return __awaiter(void 0, void 0, void 0, function () {
        var CONNECTION, _a, error_4;
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
                    CONNECTION = _a;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, 6, 7]);
                    return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.update, [
                            userId,
                            description,
                            solution !== null && solution !== void 0 ? solution : null,
                            deadline,
                            departmentId,
                            status,
                            remarkId,
                        ])];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_4 = _b.sent();
                    throw error_4;
                case 6:
                    if (!connection && CONNECTION) {
                        CONNECTION.release();
                    }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); },
    get: {
        onlyOne: function (projectId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, rows, error_5;
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
                        CONNECTION = _a;
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, 6, 7]);
                        return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.select.onlyOne, [
                                projectId,
                            ])];
                    case 4:
                        rows = (_b.sent())[0];
                        return [2 /*return*/, rows];
                    case 5:
                        error_5 = _b.sent();
                        throw error_5;
                    case 6:
                        if (!connection && CONNECTION) {
                            CONNECTION.release();
                        }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); },
        all: {
            forReport: function (companyId, connection) { return __awaiter(void 0, void 0, void 0, function () {
                var CONNECTION, _a, rows, error_6;
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
                            CONNECTION = _a;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, 6, 7]);
                            return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.select.all.forReport, [companyId])];
                        case 4:
                            rows = (_b.sent())[0];
                            return [2 /*return*/, rows];
                        case 5:
                            error_6 = _b.sent();
                            throw error_6;
                        case 6:
                            if (!connection && CONNECTION) {
                                CONNECTION.release();
                            }
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            }); },
            all: function (companyId_1) {
                var args_1 = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args_1[_i - 1] = arguments[_i];
                }
                return __awaiter(void 0, __spreadArray([companyId_1], args_1, true), void 0, function (companyId, searchTerms, connection) {
                    var CONNECTION, _a, pattern, rows, error_7;
                    if (searchTerms === void 0) { searchTerms = ""; }
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
                                CONNECTION = _a;
                                _b.label = 3;
                            case 3:
                                _b.trys.push([3, 5, 6, 7]);
                                pattern = "%".concat(searchTerms, "%");
                                return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.select.all.all, [
                                        companyId,
                                        pattern,
                                        pattern,
                                        pattern,
                                        pattern,
                                        pattern,
                                        pattern,
                                        pattern,
                                    ])];
                            case 4:
                                rows = (_b.sent())[0];
                                return [2 /*return*/, rows];
                            case 5:
                                error_7 = _b.sent();
                                throw error_7;
                            case 6:
                                if (!connection && CONNECTION) {
                                    CONNECTION.release();
                                }
                                return [7 /*endfinally*/];
                            case 7: return [2 /*return*/];
                        }
                    });
                });
            },
            byDepId: function (companyId, departmentId, connection) { return __awaiter(void 0, void 0, void 0, function () {
                var CONNECTION, _a, rows, error_8;
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
                            CONNECTION = _a;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, 6, 7]);
                            return [4 /*yield*/, CONNECTION.query(journalRemark_1.remarkQuerys.select.all.byDepId, [
                                    companyId,
                                    departmentId,
                                ])];
                        case 4:
                            rows = (_b.sent())[0];
                            return [2 /*return*/, rows];
                        case 5:
                            error_8 = _b.sent();
                            throw error_8;
                        case 6:
                            if (!connection && CONNECTION) {
                                CONNECTION.release();
                            }
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            }); },
        },
    },
};
