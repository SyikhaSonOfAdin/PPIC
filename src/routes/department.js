const { departmentControllers } = require('../controllers/department');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', departmentControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, departmentControllers.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, departmentControllers.delete.onlyOne)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, departmentControllers.get.all)
router.get('/get/:companyId/:departmentId', jwtServices.verifyToken.byHeader, departmentControllers.get.onlyOne)

module.exports = {
    departmentRouter: router
}