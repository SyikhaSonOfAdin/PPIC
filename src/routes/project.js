const { projectControllers } = require('../controllers/project');
const { privilege } = require('../middlewares/privilege');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987838-08c3-7772-9ed6-c473ae329470"), projectControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987839-d26e-7772-9ed6-ccd8de97ea37"), projectControllers.edit.all)
router.post('/edit/d/deliver', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987839-d26e-7772-9ed6-ccd8de97ea37"), projectControllers.edit.deliver)
router.post('/delete', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("0198783a-0811-7772-9ed6-d47d8803e2d9"), projectControllers.delete)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, projectControllers.get.all)
router.get('/get/:companyId/:projectId', jwtServices.verifyToken.byHeader, projectControllers.get.onlyOne)
router.get('/get/s/d/:companyId', jwtServices.verifyToken.byHeader, projectControllers.get.summary)
router.get('/get/download/plans-and-actual/:companyId/:year', jwtServices.verifyToken.byHeader, projectControllers.get.download.plans_and_actual)

module.exports = {
    projectRouter: router
}