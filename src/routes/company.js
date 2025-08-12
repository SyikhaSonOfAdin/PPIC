const { companyPreferenceController } = require('../controllers/companyPreference');
const { companyControllers } = require('../controllers/company');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post("/registration", companyControllers.registration)
router.post("/preference/productivity/period/add", companyPreferenceController.add.productivity.period)
router.get("/reg/c/:cId", jwtServices.verifyToken.byQuery, companyControllers.edit.setActive)

module.exports = {
    companyRouter: router
}