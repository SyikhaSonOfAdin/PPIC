const { phaseScheduleControllers } = require('../controllers/phaseSchedule');
const { jwtServices } = require('../middlewares/jwt');
const { privilege } = require('../middlewares/privilege');
const express = require('express');

const router = express.Router();

router.get(
  '/get/:projectId',
  jwtServices.verifyToken.byHeader,
  phaseScheduleControllers.get.byProject
);

router.post(
  '/add',
  jwtServices.verifyToken.byHeader,
  privilege.hasPrivilege('01987838-08c3-7772-9ed6-c473ae329470'),
  phaseScheduleControllers.add
);

router.post(
  '/edit',
  jwtServices.verifyToken.byHeader,
  privilege.hasPrivilege('01987839-d26e-7772-9ed6-ccd8de97ea37'),
  phaseScheduleControllers.edit
);

router.post(
  '/delete-one',
  jwtServices.verifyToken.byHeader,
  privilege.hasPrivilege('0198783a-0811-7772-9ed6-d47d8803e2d9'),
  phaseScheduleControllers.delete.onlyOne
);

router.put(
  '/reorder/:projectId',
  jwtServices.verifyToken.byHeader,
  privilege.hasPrivilege('01987839-d26e-7772-9ed6-ccd8de97ea37'),
  phaseScheduleControllers.reorder
);

module.exports = { phaseScheduleRouter: router };
