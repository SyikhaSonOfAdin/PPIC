const { workLoadControllers } = require('../controllers/workLoad');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, workLoadControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, workLoadControllers.edit)
router.post('/delete', jwtServices.verifyToken.byHeader, workLoadControllers.delete.onlyOne)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, workLoadControllers.get)

module.exports = {
    workLoadRouter: router
}