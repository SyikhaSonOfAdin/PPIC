"use strict";
const { PRODUCTIVITY_APP } = require("../.config/url.conf");
const axios = require("axios");

/**
 * Pull budget/cost/man_hours per project_detail dari Productivity BE --
 * dipanggil saat user membuka halaman detail project (bukan push/event,
 * bukan disimpan ke DB). company_id + project_no (PROJECT_NO) dikirim,
 * Productivity BE membalas array target (satu entri per project_detail row
 * dengan PROJECT_NO yang sama), hasil resolusi alokasi biaya yang SAMA
 * dengan yang ditampilkan tab Allocation di app itu sendiri.
 *
 * Timeout pendek + kegagalan apapun ditelan (return []) -- halaman detail
 * project TIDAK BOLEH gagal/lambat gara-gara Productivity BE down/lambat.
 * Data lokal (BUDGET/COST/MAN_HOURS manual admin di project_detail) tetap
 * tampil apa adanya di luar fungsi ini -- ini cuma lapisan tambahan opsional,
 * tidak pernah menimpa data lokal.
 */
async function getCostSummary({ companyId, projectNo }) {
    if (!PRODUCTIVITY_APP.server) return [];
    try {
        const { data } = await axios.post(
            `${PRODUCTIVITY_APP.server}/api/projects/cost-summary-s2s`,
            { company_id: companyId, project_code: projectNo },
            {
                headers: {
                    "x-server-key": process.env.PRODUCTIVITY_APP_SERVER_KEY,
                    "Content-Type": "application/json",
                },
                timeout: 3000,
            }
        );
        return data?.data?.targets ?? [];
    } catch (err) {
        console.warn("[Productivity Cost Summary] Gagal ambil data:", projectNo, err.message);
        return [];
    }
}

module.exports = { getCostSummary };
