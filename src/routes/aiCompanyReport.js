const { aiCompanyReportController } = require("../controllers/aiCompanyReport");
const { jwtServices } = require("../middlewares/jwt");
const { rateLimiter } = require("../middlewares/rateLimiter");
const express = require("express");

const router = express.Router();

router.get(
  "/company/report/status",
  jwtServices.verifyToken.byHeader,
  aiCompanyReportController.status,
);
router.get(
  "/company/report/:companyId",
  jwtServices.verifyToken.byHeader,
  aiCompanyReportController.get.byCompanyId,
);
router.post(
  "/company/report/generate/:companyId",
  jwtServices.verifyToken.byHeader,
  rateLimiter,
  aiCompanyReportController.generate,
);

module.exports = { aiCompanyReportRouter: router };
