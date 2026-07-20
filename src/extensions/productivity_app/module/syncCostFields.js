"use strict";
const { PPIC } = require("../../../config/db");

/**
 * Write-through: simpan hasil productivityAppSummary (BUDGET/COST/MAN_HOURS/
 * PRODUCTIVITY/PRODUCTIVITY_COST) yang barusan ditarik getCostSummary() ke
 * kolom project_detail yang sama -- supaya kolom lokal (dipakai KPI table,
 * ProductivityTab, dst.) ikut ter-update tanpa admin harus edit manual,
 * tanpa perlu kolom baru atau infra sync terpisah.
 *
 * Sengaja HANYA dipanggil untuk row yang lagi dibuka (project_detail ID
 * projectId), bukan seluruh sibling PROJECT_NO -- menghindari query
 * progressPercentage() tambahan per sibling row di setiap page-view.
 *
 * Fire-and-forget dari caller: pakai koneksi sendiri (bukan transaction baca
 * yang sedang berjalan di onlyOne), kegagalan cuma di-log, tidak pernah
 * melempar ke caller.
 *
 * Transaksi eksplisit sendiri (bukan asumsi autocommit) -- koneksi dari
 * pool.getConnection() BUKAN jaminan bersih, bisa saja itu koneksi fisik
 * yang sebelumnya dipakai handler lain yang lupa commit/rollback (lihat
 * bug onlyOne yang menyebabkan Lock wait timeout). Dengan beginTransaction
 * eksplisit di sini, UPDATE ini pasti dalam transaksi milik sendiri dan
 * SELALU di-commit/rollback sebelum koneksi dilepas -- konsisten dengan
 * pola yang sudah dipakai service function lain di codebase ini.
 *
 * BUDGET pakai COALESCE -- summary.BUDGET bisa null kalau Productivity app
 * belum mengonfigurasi budget share untuk project_detail ini, dan itu BUKAN
 * berarti budget manual yang sudah ada harus dihapus.
 */
async function syncCostFields(projectId, summary) {
  if (!summary) return;
  try {
    const conn = await PPIC.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `UPDATE project_detail SET
           BUDGET = COALESCE(?, BUDGET),
           COST = ?,
           MAN_HOURS = ?,
           PRODUCTIVITY = ?,
           PRODUCTIVITY_COST = ?
         WHERE PROJECT_ID = ?`,
        [
          summary.BUDGET,
          summary.COST,
          summary.MAN_HOURS,
          summary.PRODUCTIVITY,
          summary.PRODUCTIVITY_COST,
          projectId,
        ]
      );
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.warn("[Productivity Cost Sync] Gagal simpan project_detail:", projectId, err.message);
  }
}

module.exports = { syncCostFields };
