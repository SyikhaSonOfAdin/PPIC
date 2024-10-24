const { companyControllers } = require('../controllers/company');
const express = require('express');
const { jwtServices } = require('../middlewares/jwt');
const router = express.Router();

router.post("/registration", companyControllers.registration)
router.get("/reg/c/:cId", jwtServices.verifyToken.byQuery, companyControllers.edit.setActive)

module.exports = {
    companyRouter: router
}