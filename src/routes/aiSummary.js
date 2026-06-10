const { aiSummaryController } = require("../controllers/aiSummary");
const { jwtServices } = require("../middlewares/jwt");
const express = require("express");
const { privilege } = require("../middlewares/privilege");

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
  privilege.hasPrivilege('019e96f0-f58a-7f67-aef2-c95a0d8c934e'),
  aiSummaryController.regenerate,
);

module.exports = { aiSummaryRouter: router };
