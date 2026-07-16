"use strict";
const { PRODUCTIVITY_APP } = require("../.config/url.conf");
const { PPIC } = require("../../../config/db");
const axios = require("axios");

const productivityAppController = {
    access: async (req, res) => {
        // req.u diisi oleh jwtServices.verifyToken.byHeader dari cookie auth_token
        const { email, user, company } = req.u;

        try {
            // Ambil argon2 hash dari Main BE untuk dikirim ke Productivity BE
            const conn = await PPIC.getConnection();
            const [[userRow]] = await conn.query(
                "SELECT PASSWORD FROM users WHERE ID = ? LIMIT 1",
                [user.id]
            );
            conn.release();

            const params = {
                company_id:    company.id,
                company_name:  company.name,
                user_id:       user.id,
                username:      req.body.username || email.split('@')[0],
                email,
                password_hash: userRow?.PASSWORD ?? null,
            };

            const { data } = await axios.post(
                `${PRODUCTIVITY_APP.server}/api/auth/register-s2s`,
                params,
                {
                    headers: {
                        "x-server-key": process.env.PRODUCTIVITY_APP_SERVER_KEY,
                        "Content-Type": "application/json",
                    },
                }
            );

            return res.status(200).json({
                message: "Access Granted",
                data: {
                    url: `${PRODUCTIVITY_APP.app}/login?code=${data.data?.redeem_code}`,
                },
            });
        } catch (error) {
            console.error("[Productivity App SSO Error]:", error.response?.data || error.message);
            res.status(error.response?.status || 500).json({
                message: error.response?.data?.message || error.message,
            });
        }
    },

};

module.exports = { productivityAppController };
