const express = require('express');
const { userControllers } = require('../controllers/user');
const { jwtServices } = require('../middlewares/jwt');
const router = express.Router();

router.post('/login', userControllers.login)
router.post('/add', jwtServices.verifyToken.byHeader, userControllers.add)
router.post('/edit/department', jwtServices.verifyToken.byHeader, userControllers.update.department)
// router.post('/delete', jwtServices.verifyToken.byHeader, userControllers.delete)
router.post('/delete/department', jwtServices.verifyToken.byHeader, userControllers.delete.department)
router.get('/get/all/:companyId', jwtServices.verifyToken.byHeader, userControllers.get.all)
router.get('/get/dep/:companyId', jwtServices.verifyToken.byHeader, userControllers.get.withoutDep)
router.get('/get/dep/:companyId/:departmentId', jwtServices.verifyToken.byHeader, userControllers.get.byDepId)

module.exports = {
    userRouter: router
}