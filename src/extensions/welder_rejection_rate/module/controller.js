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
var url_conf_1 = require("../.config/url.conf");
var axios_1 = require("axios");
var welderRejectionRateController = {
    access: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, project_id, project_no, project_name, client, username, _b, email, user, company, params, data, error_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = req.body, project_id = _a.project_id, project_no = _a.project_no, project_name = _a.project_name, client = _a.client, username = _a.username;
                    _b = req.u, email = _b.email, user = _b.user, company = _b.company;
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    params = {
                        project_id: project_id,
                        project_no: project_no,
                        project_name: project_name,
                        client: client,
                        username: username,
                        email: email,
                        user_id: user.id,
                        company_name: company.name,
                        company_id: company.id,
                    };
                    return [4 /*yield*/, axios_1.default.post("".concat(url_conf_1.WELDER_REJECTION_RATE_APP.server, "/register"), params)];
                case 2:
                    data = (_d.sent()).data;
                    return [2 /*return*/, res.status(200).json({
                            message: "Access Granted",
                            data: {
                                url: "".concat(url_conf_1.WELDER_REJECTION_RATE_APP.app, "/login?code=").concat((_c = data.data) === null || _c === void 0 ? void 0 : _c.redeem_code, "&project_id=").concat(project_id),
                            },
                        })];
                case 3:
                    error_1 = _d.sent();
                    res.status(500).json({
                        message: error_1.message,
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    getOverall: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var project_id, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    project_id = req.params.project_id;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("".concat(url_conf_1.WELDER_REJECTION_RATE_APP.server, "/rejection_rate/overall/").concat(project_id))];
                case 2:
                    data = (_a.sent()).data;
                    return [2 /*return*/, res.status(200).json({
                            message: "Access Granted",
                            data: data,
                        })];
                case 3:
                    error_2 = _a.sent();
                    res.status(500).json({
                        message: error_2.message,
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
};
exports.default = welderRejectionRateController;
