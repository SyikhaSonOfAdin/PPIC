"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sap_dummy_1 = __importDefault(require("../services/sap-dummy"));
const sapDummyController = {
    get: {
        by: {
            projectNo: async (req, res) => {
                const stages = [
                    "request_purchase",
                    "purchase_order",
                    "goods_receive_purchase_order",
                    "inventory_transfer_request",
                    "inventory_transfer",
                    "goods_issue",
                    "goods_receipt",
                    // KBN Fields
                    "request_purchase_kbn",
                    "purchase_order_kbn",
                    "goods_receive_purchase_order_kbn",
                    "inventory_transfer_request_kbn",
                    "inventory_transfer_kbn",
                    "goods_issue_kbn",
                    "goods_receipt_kbn",
                ];
                try {
                    // prettier-ignore
                    const { projectNo, identCode } = req.params;
                    const { s, p, page, group } = req.query;
                    // prettier-ignore
                    if (!projectNo)
                        return res.status(400).json({ message: "Invalid Parameters" });
                    if (!identCode) {
                        const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
                        const summaryResponse = await sap_dummy_1.default.get.summary.projectNo(projectNo, pageNum, s ?? "", group ?? "");
                        if (!summaryResponse.success) {
                            return res.status(502).json(summaryResponse);
                        }
                        return res.status(200).json({
                            success: true,
                            last_update: summaryResponse.last_update ?? "-",
                            groups: summaryResponse.groups ?? [],
                            data: summaryResponse.data,
                            pagination: summaryResponse.pagination,
                        });
                    }
                    if (!p) {
                        return res.status(400).json({ message: "Invalid Parameters: p (stage) is required when identCode is provided" });
                    }
                    const response = await sap_dummy_1.default.get.by.projectNo(projectNo, 
                    //@ts-ignore
                    s ?? "");
                    const items = new Map();
                    response.data.data[p]
                        .filter((r) => r.item_code == identCode)
                        .forEach((r) => {
                        items.set(r.id, {
                            ...r,
                            id: r.item_code,
                            group: r.group ?? null,
                            description: r.item_description ?? null,
                            project_no: projectNo,
                            input_date: r.doc_date
                                ? new Date(r.doc_date).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                })
                                : null,
                        });
                    });
                    return res.status(200).json({
                        success: true,
                        last_update: response.data?.last_update ?? "-",
                        data: Array.from(items.values()),
                    });
                }
                catch (error) {
                    const status = error?.status ?? error?.statusCode ?? 500;
                    const body = error?.data ?? error?.message ?? error;
                    return res.status(status).json(body);
                }
            },
        },
        status: {
            projectNo: async (req, res) => {
                const stages = [
                    "request_purchase",
                    "purchase_order",
                    "goods_receive_purchase_order",
                    "inventory_transfer_request",
                    "inventory_transfer",
                    "goods_issue",
                    "goods_receipt",
                    // KBN Fields
                    "request_purchase_kbn",
                    "purchase_order_kbn",
                    "goods_receive_purchase_order_kbn",
                    "inventory_transfer_request_kbn",
                    "inventory_transfer_kbn",
                    "goods_issue_kbn",
                    "goods_receipt_kbn",
                ];
                try {
                    const { projectNo } = req.params;
                    const { s } = req.query;
                    if (!projectNo)
                        return res.status(400).json({ message: "Invalid Parameters" });
                    const response = await sap_dummy_1.default.get.status.projectNo(projectNo, 
                    //@ts-ignore
                    s);
                    if (response.success) {
                        const items = new Map();
                        /**
                         * Get unique ident code
                         */
                        stages.forEach((s) => {
                            //@ts-ignore
                            response.data.data[s].forEach((g) => {
                                items.set(g.item_code + "|" + g.group + "|" + g.item_description, {
                                    request_purchase: 0,
                                    purchase_order: 0,
                                    goods_receive_purchase_order: 0,
                                    inventory_transfer_request: 0,
                                    inventory_transfer: 0,
                                    goods_issue: 0,
                                    goods_receipt: 0,
                                    // KBN Fields
                                    request_purchase_kbn: 0,
                                    purchase_order_kbn: 0,
                                    goods_receive_purchase_order_kbn: 0,
                                    inventory_transfer_request_kbn: 0,
                                    inventory_transfer_kbn: 0,
                                    goods_issue_kbn: 0,
                                    goods_receipt_kbn: 0,
                                });
                            });
                        });
                        /**
                         * Create the summary data based on stored item code
                         */
                        Array.from(items.keys()).forEach((key) => {
                            const id = key.split("|")[0]; // Item Code
                            const group = key.split("|")[1]; // Item Group
                            const description = key.split("|")[2]; // Item Description
                            const sum = {
                                id,
                                group,
                                description,
                                request_purchase: response.data.data.request_purchase?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                purchase_order: response.data.data.purchase_order?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                goods_receive_purchase_order: response.data.data.goods_receive_purchase_order?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                inventory_transfer_request: response.data.data.inventory_transfer_request?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                inventory_transfer: response.data.data.inventory_transfer?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                goods_issue: response.data.data.goods_issue?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                goods_receipt: response.data.data.goods_receipt?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                /**
                                 * KBN FIELDS
                                 */
                                request_purchase_kbn: response.data.data.request_purchase_kbn?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                purchase_order_kbn: response.data.data.purchase_order_kbn?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                goods_receive_purchase_order_kbn: response.data.data.goods_receive_purchase_order_kbn?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                inventory_transfer_request_kbn: response.data.data.inventory_transfer_request_kbn?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                inventory_transfer_kbn: response.data.data.inventory_transfer_kbn?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                goods_issue_kbn: response.data.data.goods_issue_kbn?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                                goods_receipt_kbn: response.data.data.goods_receipt_kbn?.reduce((acc, row) => row.item_code === id ? acc + (row.quantity ?? 0) : acc, 0) || 0,
                            };
                            items.set(key, sum);
                        });
                        res.status(200).send({
                            success: true,
                            last_update: response.data?.last_update ?? "-",
                            data: Array.from(items.values()),
                        });
                    }
                    else {
                        res.send(response);
                    }
                }
                catch (error) {
                    console.error(error);
                    res
                        .status(500)
                        .send({ error: "An error occurred", message: error.message });
                }
            },
        },
    },
    update: {
        single: {
            by: {
                projectNo: async (req, res) => {
                    try {
                        const { projectNo } = req.body;
                        if (!projectNo)
                            return res.status(400).json({ message: "Invalid Parameters" });
                        const response = await sap_dummy_1.default.update.by.projectNo(projectNo);
                        res.status(200).send(response);
                    }
                    catch (error) {
                        console.error(error);
                        res.status(500).send(error);
                    }
                },
            },
        },
    },
};
module.exports = {
    sapDummyController,
};
