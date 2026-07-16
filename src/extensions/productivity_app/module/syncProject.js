"use strict";
const { PRODUCTIVITY_APP } = require("../.config/url.conf");
const { PPIC } = require("../../../config/db");
const axios = require("axios");

/**
 * Dipanggil setelah create/edit project di Main BE — fire and forget.
 * Mengagregasi semua baris dengan PROJECT_NO yang sama lalu push ke Productivity BE.
 */
async function syncProject({ companyId, projectNo, userId }) {
    try {
        const conn = await PPIC.getConnection();
        let rows;
        try {
            [rows] = await conn.query(
                `SELECT
                    MIN(pd.START_DATE)  AS start_date,
                    MAX(pd.DUE_DATE)    AS due_date,
                    cp.CLIENT           AS client_name,
                    MIN(pd.NAME)        AS name,
                    pd.WORK_PLACE       AS workshop,
                    (
                        SELECT IF(
                            pd2.FINISH_DATE IS NOT NULL AND pd2.FINISH_DATE != '0000-00-00',
                            'COMPLETED', 'ON_GOING'
                        )
                        FROM project_detail pd2
                        JOIN company_projects cp2 ON pd2.PROJECT_ID = cp2.ID
                        WHERE cp2.COMPANY_ID = ? AND cp2.PROJECT_NO = ?
                        ORDER BY pd2.DUE_DATE DESC
                        LIMIT 1
                    ) AS status
                FROM company_projects cp
                JOIN project_detail pd ON cp.ID = pd.PROJECT_ID
                WHERE cp.COMPANY_ID = ? AND cp.PROJECT_NO = ?
                GROUP BY cp.CLIENT, pd.WORK_PLACE`,
                [companyId, projectNo, companyId, projectNo]
            );
        } finally {
            conn.release();
        }

        if (!rows || rows.length === 0) return;

        const { start_date, due_date, client_name, name, status } = rows[0];

        // Kirim satu sync per workshop — satu PROJECT_NO bisa punya banyak WORK_PLACE
        for (const row of rows) {
            await axios.post(
                `${PRODUCTIVITY_APP.server}/api/projects/sync`,
                { company_id: companyId, project_no: projectNo, name, client_name, start_date, due_date, status, user_id: userId, workshop: row.workshop ?? null },
                { headers: { "x-server-key": process.env.PRODUCTIVITY_APP_SERVER_KEY, "Content-Type": "application/json" } }
            );
        }
    } catch (err) {
        // Fire and forget — kegagalan sync tidak boleh menggagalkan operasi di Main BE
        console.warn("[Productivity Sync] Gagal sync project:", projectNo, err.message);
    }
}

module.exports = { syncProject };
