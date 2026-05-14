const { aiSummaryController } = require("../controllers/aiSummary");
const { jwtServices } = require("../middlewares/jwt");
const express = require("express");

const router = express.Router();

router.get(
  "/summary/status",
  jwtServices.verifyToken.byHeader,
  aiSummaryController.status,
);
router.get(
  "/summary/project/:projectId",
  jwtServices.verifyToken.byHeader,
  aiSummaryController.get.byProjectId,
);
router.post(
  "/summary/enqueue",
  jwtServices.verifyToken.byHeader,
  aiSummaryController.enqueue,
);
router.post(
  "/summary/regenerate/:projectId",
  jwtServices.verifyToken.byHeader,
  aiSummaryController.regenerate,
);

module.exports = { aiSummaryRouter: router };
