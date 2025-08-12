const express = require('express');
const { userControllers } = require('../controllers/user');
const { jwtServices } = require('../middlewares/jwt');
const { privilege } = require('../middlewares/privilege');
const router = express.Router();

router.post('/login', userControllers.login)
router.post('/add', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987858-ad48-711f-a641-d2a7727d9881"), userControllers.add)
router.post('/edit/single/:userId', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987858-ad48-711f-a641-d2a7727d9881"), userControllers.update.single)
router.post('/edit/department', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987856-143c-711f-a641-c8799a65e281"), userControllers.update.department)
router.post('/delete', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987858-ad48-711f-a641-d2a7727d9881"), userControllers.delete.user)
router.post('/delete/department', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987856-143c-711f-a641-c8799a65e281"), userControllers.delete.department)
router.get('/get/all/:companyId', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987858-ad48-711f-a641-d2a7727d9881"), userControllers.get.all)
router.get('/get/single/:userId', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987858-ad48-711f-a641-d2a7727d9881"), userControllers.get.single)
router.get('/get/dep/:companyId', jwtServices.verifyToken.byHeader, userControllers.get.withoutDep)
router.get('/get/dep/:companyId/:departmentId', jwtServices.verifyToken.byHeader, userControllers.get.byDepId)

module.exports = {
    userRouter: router
}   