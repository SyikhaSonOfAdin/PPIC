const { journalRemarkController } = require('../controllers/journalRemark');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, journalRemarkController.add)
router.post('/edit', jwtServices.verifyToken.byHeader, journalRemarkController.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, journalRemarkController.delete.onlyOne)
router.post('/delete-all', jwtServices.verifyToken.byHeader, journalRemarkController.delete.all)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, journalRemarkController.get.onlyOne)
router.get('/get/all/:companyId', jwtServices.verifyToken.byHeader, journalRemarkController.get.all)

module.exports = {
    journalRemarkRouter: router
}