"use strict";
const sapDummyServices = require("../services/sap-dummy").default;

const VALID_STAGES = new Set([
  "request_purchase",
  "purchase_order",
  "goods_receive_purchase_order",
  "inventory_transfer_request",
  "inventory_transfer",
  "goods_issue",
  "goods_receipt",
  "request_purchase_kbn",
  "purchase_order_kbn",
  "goods_receive_purchase_order_kbn",
  "inventory_transfer_request_kbn",
  "inventory_transfer_kbn",
  "goods_issue_kbn",
  "goods_receipt_kbn",
]);

/**
 * Shared handler for summary view (paginated, pre-aggregated).
 * Used by both get.by.projectNo (no identCode) and get.status.projectNo.
 */
const getSummary = async (req, res) => {
  const { projectNo } = req.params;
  const { s, page } = req.query;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);

  if (!projectNo) return res.status(400).json({ message: "Invalid Parameters" });

  try {
    const response = await sapDummyServices.get.summary.projectNo(
      projectNo,
      pageNum,
      s ?? "",
    );

    if (!response.success) return res.status(502).json(response);

    return res.status(200).json({
      success: true,
      last_update: response.last_update ?? "-",
      groups: response.groups ?? [],
      data: response.data,
      pagination: response.pagination,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred",
      message: error?.message ?? String(error),
    });
  }
};

const sapDummyController = {
  get: {
    by: {
      projectNo: async (req, res) => {
        const { projectNo, identCode } = req.params;
        const { s, p } = req.query;

        if (!projectNo)
          return res.status(400).json({ message: "Invalid Parameters" });

        try {
          // Detail view: raw rows filtered by item_code
          if (identCode) {
            if (!p || !VALID_STAGES.has(p)) {
              return res.status(400).json({ message: "Invalid stage parameter" });
            }

            const response = await sapDummyServices.get.by.projectNo(projectNo, s);

            if (response.success === false) {
              return res.status(502).json(response);
            }

            const items = new Map();
            (response.data?.data?.[p] ?? [])
              .filter((r) => r.item_code == identCode)
              .forEach((r) => {
                items.set(r.id, {
                  ...r,
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

          // Summary view: delegate to shared handler
          return getSummary(req, res);
        } catch (error) {
          console.error(error);
          res.status(500).json({
            error: "An error occurred",
            message: error?.message ?? String(error),
          });
        }
      },
    },
    status: {
      projectNo: getSummary,
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

            const response = await sapDummyServices.update.by.projectNo(projectNo);
            res.status(200).json(response);
          } catch (error) {
            console.error(error);
            res.status(500).json(error);
          }
        },
      },
    },
  },
};

module.exports = { sapDummyController };
