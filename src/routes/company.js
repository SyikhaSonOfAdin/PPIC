const { companyPreferenceController } = require('../controllers/companyPreference');
const { companyControllers } = require('../controllers/company');
const { privilege } = require('../middlewares/privilege');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post("/registration", companyControllers.registration)
router.post("/preference/productivity/period/add", jwtServices.verifyToken.byHeader, privilege.hasPrivilege("0198a0f5-8338-7772-9e68-16e27b2e9b3a"), companyPreferenceController.add.productivity.period)
router.get("/reg/c/:cId", jwtServices.verifyToken.byQuery, companyControllers.edit.setActive)

module.exports = {
    companyRouter: router
}