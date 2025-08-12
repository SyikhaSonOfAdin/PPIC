const { processControllers } = require('../controllers/process');
const { privilege } = require('../middlewares/privilege');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.get('/get/:companyId', jwtServices.verifyToken.byHeader, processControllers.get.all)
router.get('/get/:companyId/:projectId', jwtServices.verifyToken.byHeader, processControllers.get.by.projectId)
router.post('/add', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("0198886a-64b6-766a-aa68-476aa76901e8"), processControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("0198886a-a534-766a-aa68-4f1d9ea7efa1"), processControllers.edit)
router.post('/delete/:rowId', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("0198886a-ce45-766a-aa68-5322c82bf1ca"), processControllers.delete.onlyOne)

module.exports = {
    processRouter: router
}