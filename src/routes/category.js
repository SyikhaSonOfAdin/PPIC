const { categoryControllers } = require('../controllers/category');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', categoryControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, categoryControllers.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, categoryControllers.delete.onlyOne)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, categoryControllers.get)

module.exports = {
    categoryRouter: router
}