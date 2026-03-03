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
var sap_dummy_1 = require("../services/sap-dummy");
var sapDummyController = {
    get: {
        by: {
            projectNo: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var stages, _a, projectNo_1, identCode_1, _b, s, p, response_1, items_1, error_1;
                var _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            stages = [
                                "request_purchase",
                                "purchase_order",
                                "goods_receive_purchase_order",
                                "inventory_transfer_request",
                                "inventory_transfer",
                                "goods_issue",
                                "goods_receipt",
                            ];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 3, , 4]);
                            _a = req.params, projectNo_1 = _a.projectNo, identCode_1 = _a.identCode;
                            _b = req.query, s = _b.s, p = _b.p;
                            // prettier-ignore
                            if (!projectNo_1)
                                return [2 /*return*/, res.status(400).json({ message: "Invalid Parameters" })];
                            return [4 /*yield*/, sap_dummy_1.default.get.by.projectNo(projectNo_1, 
                                //@ts-ignore
                                s)];
                        case 2:
                            response_1 = _e.sent();
                            items_1 = new Map();
                            if (!identCode_1) {
                                /**
                                 * Get unique ident code
                                 */
                                stages.forEach(function (s) {
                                    //@ts-ignore
                                    response_1.data.data[s].forEach(function (g) {
                                        items_1.set(g.item_code + "|" + g.group + "|" + g.item_description, {
                                            request_purchase: 0,
                                            purchase_order: 0,
                                            goods_receive_purchase_order: 0,
                                            inventory_transfer_request: 0,
                                            inventory_transfer: 0,
                                            goods_issue: 0,
                                            goods_receipt: 0,
                                        });
                                    });
                                });
                                /**
                                 * Create the summary data based on stored item code
                                 */
                                Array.from(items_1.keys()).forEach(function (key) {
                                    var _a, _b, _c, _d, _e, _f, _g;
                                    var id = key.split("|")[0]; // Item Code
                                    var group = key.split("|")[1]; // Item Group
                                    var description = key.split("|")[2]; // Item Description
                                    var sum = {
                                        id: id,
                                        group: group,
                                        description: description,
                                        request_purchase: ((_a = response_1.data.data.request_purchase) === null || _a === void 0 ? void 0 : _a.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        purchase_order: ((_b = response_1.data.data.purchase_order) === null || _b === void 0 ? void 0 : _b.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        goods_receive_purchase_order: ((_c = response_1.data.data.goods_receive_purchase_order) === null || _c === void 0 ? void 0 : _c.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        inventory_transfer_request: ((_d = response_1.data.data.inventory_transfer_request) === null || _d === void 0 ? void 0 : _d.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        inventory_transfer: ((_e = response_1.data.data.inventory_transfer) === null || _e === void 0 ? void 0 : _e.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        goods_issue: ((_f = response_1.data.data.goods_issue) === null || _f === void 0 ? void 0 : _f.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        goods_receipt: ((_g = response_1.data.data.goods_receipt) === null || _g === void 0 ? void 0 : _g.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                    };
                                    items_1.set(key, sum);
                                });
                            }
                            else if (identCode_1 && p) {
                                response_1.data.data[p]
                                    .filter(function (r) { return r.item_code == identCode_1; })
                                    .forEach(function (r) {
                                    items_1.set(r.id, {
                                        project_no: projectNo_1,
                                        item_code: r.item_code,
                                        group: r.group,
                                        input_date: r.doc_date
                                            ? new Date(r.doc_date).toLocaleDateString("id-ID", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })
                                            : null,
                                        desc: r.item_description,
                                        dimension: r.dimension,
                                        qty: r.quantity,
                                        warehouse: r.warehouse,
                                        cost_centre: r.cost_centre,
                                        remark: r.doc_remarks,
                                    });
                                });
                            }
                            else {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid Parameters" })];
                            }
                            return [2 /*return*/, res.status(200).send({
                                    success: true,
                                    last_update: (_d = (_c = response_1.data) === null || _c === void 0 ? void 0 : _c.last_update) !== null && _d !== void 0 ? _d : "-",
                                    data: Array.from(items_1.values()),
                                })];
                        case 3:
                            error_1 = _e.sent();
                            console.error(error_1);
                            res
                                .status(500)
                                .send({ error: "An error occurred", message: error_1.message });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); },
        },
        status: {
            projectNo: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                var stages, projectNo, s, response_2, items_2, error_2;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            stages = [
                                "request_purchase",
                                "purchase_order",
                                "goods_receive_purchase_order",
                                "inventory_transfer_request",
                                "inventory_transfer",
                                "goods_issue",
                                "goods_receipt",
                            ];
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 3, , 4]);
                            projectNo = req.params.projectNo;
                            s = req.query.s;
                            if (!projectNo)
                                return [2 /*return*/, res.status(400).json({ message: "Invalid Parameters" })];
                            return [4 /*yield*/, sap_dummy_1.default.get.status.projectNo(projectNo, 
                                //@ts-ignore
                                s)];
                        case 2:
                            response_2 = _c.sent();
                            if (response_2.success) {
                                items_2 = new Map();
                                /**
                                 * Get unique ident code
                                 */
                                stages.forEach(function (s) {
                                    //@ts-ignore
                                    response_2.data.data[s].forEach(function (g) {
                                        items_2.set(g.item_code + "|" + g.group + "|" + g.item_description, {
                                            request_purchase: 0,
                                            purchase_order: 0,
                                            goods_receive_purchase_order: 0,
                                            inventory_transfer_request: 0,
                                            inventory_transfer: 0,
                                            goods_issue: 0,
                                            goods_receipt: 0,
                                        });
                                    });
                                });
                                /**
                                 * Create the summary data based on stored item code
                                 */
                                Array.from(items_2.keys()).forEach(function (key) {
                                    var _a, _b, _c, _d, _e, _f, _g;
                                    var id = key.split("|")[0]; // Item Code
                                    var group = key.split("|")[1]; // Item Group
                                    var description = key.split("|")[2]; // Item Description
                                    var sum = {
                                        id: id,
                                        group: group,
                                        description: description,
                                        request_purchase: ((_a = response_2.data.data.request_purchase) === null || _a === void 0 ? void 0 : _a.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        purchase_order: ((_b = response_2.data.data.purchase_order) === null || _b === void 0 ? void 0 : _b.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        goods_receive_purchase_order: ((_c = response_2.data.data.goods_receive_purchase_order) === null || _c === void 0 ? void 0 : _c.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        inventory_transfer_request: ((_d = response_2.data.data.inventory_transfer_request) === null || _d === void 0 ? void 0 : _d.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        inventory_transfer: ((_e = response_2.data.data.inventory_transfer) === null || _e === void 0 ? void 0 : _e.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        goods_issue: ((_f = response_2.data.data.goods_issue) === null || _f === void 0 ? void 0 : _f.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                        goods_receipt: ((_g = response_2.data.data.goods_receipt) === null || _g === void 0 ? void 0 : _g.reduce(function (acc, row) { var _a; return row.item_code === id ? acc + ((_a = row.quantity) !== null && _a !== void 0 ? _a : 0) : acc; }, 0)) || 0,
                                    };
                                    items_2.set(key, sum);
                                });
                                res.status(200).send({
                                    success: true,
                                    last_update: (_b = (_a = response_2.data) === null || _a === void 0 ? void 0 : _a.last_update) !== null && _b !== void 0 ? _b : "-",
                                    data: Array.from(items_2.values()),
                                });
                            }
                            else {
                                res.send(response_2);
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            error_2 = _c.sent();
                            console.error(error_2);
                            res
                                .status(500)
                                .send({ error: "An error occurred", message: error_2.message });
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); },
        },
    },
    update: {
        single: {
            by: {
                projectNo: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var projectNo, response, error_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                projectNo = req.body.projectNo;
                                if (!projectNo)
                                    return [2 /*return*/, res.status(400).json({ message: "Invalid Parameters" })];
                                return [4 /*yield*/, sap_dummy_1.default.update.by.projectNo(projectNo)];
                            case 1:
                                response = _a.sent();
                                res.status(200).send(response);
                                return [3 /*break*/, 3];
                            case 2:
                                error_3 = _a.sent();
                                console.error(error_3);
                                res.status(500).send(error_3);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); },
            },
        },
    },
};
module.exports = {
    sapDummyController: sapDummyController,
};
