"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_conf_1 = require("../.config/url.conf");
const axios_1 = __importDefault(require("axios"));
const welderRejectionRateController = {
    access: async (req, res) => {
        const { project_id, project_no, project_name, client, username } = req.body;
        const { email, user, company } = req.u;
        try {
            const params = {
                project_id,
                project_no,
                project_name,
                client,
                username,
                email,
                user_id: user.id,
                company_name: company.name,
                company_id: company.id,
            };
            // ✅ FIX: Use /register-s2s endpoint with server key
            const { data } = await axios_1.default.post(`${url_conf_1.WELDER_REJECTION_RATE_APP.server}/register-s2s`, // ← Changed from /register
            params, {
                headers: {
                    "x-server-key": process.env.QC_SERVER_KEY, // ← Add server key
                    "Content-Type": "application/json",
                },
            });
            return res.status(200).json({
                message: "Access Granted",
                data: {
                    url: `${url_conf_1.WELDER_REJECTION_RATE_APP.app}/login?code=${data.data?.redeem_code}&project_id=${project_id}`,
                },
            });
        }
        catch (error) {
            // ✅ Better error handling
            console.error("[QC Registration Error]:", error.response?.data || error.message);
            res.status(error.response?.status || 500).json({
                message: error.response?.data?.message || error.message,
            });
        }
    },
    getOverall: async (req, res) => {
        const { project_id } = req.params;
        try {
            const { data } = await axios_1.default.get(`${url_conf_1.WELDER_REJECTION_RATE_APP.server}/rejection_rate/overall/${project_id}`);
            return res.status(200).json({
                message: "Access Granted",
                data,
            });
        }
        catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    },
};
exports.default = welderRejectionRateController;
