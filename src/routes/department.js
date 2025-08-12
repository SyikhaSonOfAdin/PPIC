const { departmentControllers } = require('../controllers/department');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const { privilege } = require('../middlewares/privilege');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987855-545a-711f-a641-b7e811f6c756'), departmentControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987855-8253-711f-a641-be46f5e12e99'), departmentControllers.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987855-b830-711f-a641-c1ea0c2f1d47'), departmentControllers.delete.onlyOne)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, departmentControllers.get.all)
router.get('/get/:companyId/:departmentId', jwtServices.verifyToken.byHeader, departmentControllers.get.onlyOne)

module.exports = {
    departmentRouter: router
}