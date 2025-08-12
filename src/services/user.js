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
exports.userServices = void 0;
var user_1 = require("../models/user");
var db_1 = require("../config/db");
var argon2 = require("argon2");
var uuid_1 = require("uuid");
exports.userServices = {
    add: function (companyId, username, email, password, connection) { return __awaiter(void 0, void 0, void 0, function () {
        var CONNECTION, _a, id, hashedPassword, error_1;
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
                    _b.trys.push([3, 6, 7, 8]);
                    id = (0, uuid_1.v7)();
                    return [4 /*yield*/, argon2.hash(password)];
                case 4:
                    hashedPassword = _b.sent();
                    return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.insert, [
                            id,
                            companyId,
                            username,
                            email,
                            hashedPassword,
                        ])];
                case 5:
                    _b.sent();
                    return [2 /*return*/, id];
                case 6:
                    error_1 = _b.sent();
                    throw error_1;
                case 7:
                    if (!connection && CONNECTION) {
                        CONNECTION.release();
                    }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); },
    edit: {
        department: function (departmentId, userId, connection) { return __awaiter(void 0, void 0, void 0, function () {
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.update.department, [
                                departmentId,
                                userId,
                            ])];
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
        single: function (userId, username, email, connection) { return __awaiter(void 0, void 0, void 0, function () {
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.update.single, [
                                username,
                                email,
                                userId,
                            ])];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, userId];
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
    check: {
        email: function (email, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, data, error_4;
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.get.onlyOne.email.byEmail, [email])];
                    case 4:
                        data = (_b.sent())[0];
                        if (data.length > 0)
                            return [2 /*return*/, true];
                        return [2 /*return*/, false];
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
    },
    delete: {
        user: function (userId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, error_5;
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.delete.user, [userId])];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
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
        department: function (userId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, error_6;
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.update.department, [null, userId])];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
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
    },
    get: {
        all: function (companyId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, data, error_7;
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.get.all.all, [companyId])];
                    case 4:
                        data = (_b.sent())[0];
                        return [2 /*return*/, data];
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
        }); },
        single: function (userId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, data, error_8;
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.get.onlyOne.all.byId, [userId])];
                    case 4:
                        data = (_b.sent())[0];
                        return [2 /*return*/, data[0]];
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
        withoutDep: function (companyId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, data, error_9;
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.get.all.withoutDepartment, [companyId])];
                    case 4:
                        data = (_b.sent())[0];
                        return [2 /*return*/, data];
                    case 5:
                        error_9 = _b.sent();
                        throw error_9;
                    case 6:
                        if (!connection && CONNECTION) {
                            CONNECTION.release();
                        }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        }); },
        byDepId: function (departmentId, connection) { return __awaiter(void 0, void 0, void 0, function () {
            var CONNECTION, _a, data, error_10;
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
                        return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.get.all.byDepId, [departmentId])];
                    case 4:
                        data = (_b.sent())[0];
                        return [2 /*return*/, data];
                    case 5:
                        error_10 = _b.sent();
                        throw error_10;
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
    login: function (email, password, connection) { return __awaiter(void 0, void 0, void 0, function () {
        var CONNECTION, _a, isExist, user, isMatch, error_11;
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
                    _b.trys.push([3, 8, 9, 10]);
                    return [4 /*yield*/, CONNECTION.query(user_1.userQuerys.get.onlyOne.all.byEmail, [email])];
                case 4:
                    isExist = (_b.sent())[0];
                    if (!(isExist.length > 0)) return [3 /*break*/, 6];
                    user = isExist[0];
                    return [4 /*yield*/, argon2.verify(user.PASSWORD, password)];
                case 5:
                    isMatch = _b.sent();
                    if (isMatch) {
                        return [2 /*return*/, user];
                    }
                    else {
                        return [2 /*return*/, "Invalid email or password"];
                    }
                    return [3 /*break*/, 7];
                case 6: return [2 /*return*/, "Email not found"];
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_11 = _b.sent();
                    throw error_11;
                case 9:
                    if (!connection && CONNECTION) {
                        CONNECTION.release();
                    }
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); },
};
