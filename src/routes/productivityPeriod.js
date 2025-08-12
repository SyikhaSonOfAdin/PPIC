const { productivityPeriodControllers } = require('../controllers/productivityPeriod');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.get('/get/:companyId/:projectId', jwtServices.verifyToken.byHeader, productivityPeriodControllers.get.byProject)

module.exports = {
    productivityPeriodRouter: router
}