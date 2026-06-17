const { extensionsControllers } = require("../controllers/extensions");
const { jwtServices } = require("../middlewares/jwt");
const { privilege } = require("../middlewares/privilege");
const express = require("express");

const router = express.Router();

router.post(
  "/test-connection",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.testConnection,
);
router.get(
  "/:companyId/by-type/:displayType",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.byType,
);
router.get(
  "/:companyId",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.list,
);
router.get(
  "/:companyId/:extensionId",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.getOne,
);
router.post(
  "/:companyId",
  jwtServices.verifyToken.byHeader,
//   privilege.hasPrivilege("01987838-08c3-7772-9ed6-c473ae329470"),
  extensionsControllers.create,
);
router.put(
  "/:companyId/:extensionId",
  jwtServices.verifyToken.byHeader,
//   privilege.hasPrivilege("01987839-d26e-7772-9ed6-ccd8de97ea37"),
  extensionsControllers.update,
);
router.delete(
  "/:companyId/:extensionId",
  jwtServices.verifyToken.byHeader,
//   privilege.hasPrivilege("0198783a-0811-7772-9ed6-d47d8803e2d9"),
  extensionsControllers.delete,
);
router.get(
  "/:companyId/:extensionId/data",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.fetchData,
);
router.get(
  "/:companyId/:extensionId/data/:projectId",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.fetchData,
);
router.post(
  "/:companyId/:extensionId/sync",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.sync,
);
router.post(
  "/:companyId/:extensionId/action-request",
  jwtServices.verifyToken.byHeader,
  extensionsControllers.actionRequest,
);

module.exports = { extensionsRouter: router };
