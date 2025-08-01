const { journalRemarkController } = require('../controllers/journalRemark');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, journalRemarkController.add)
router.post('/edit', jwtServices.verifyToken.byHeader, journalRemarkController.edit)
router.post('/send-email/:companyId', jwtServices.verifyToken.byHeader, journalRemarkController.sendEmail)
router.post('/delete-all', jwtServices.verifyToken.byHeader, journalRemarkController.delete.all)
router.post('/delete-one', jwtServices.verifyToken.byHeader, journalRemarkController.delete.onlyOne)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, journalRemarkController.get.onlyOne)
router.get('/get/report/:companyId', jwtServices.verifyToken.byHeader, journalRemarkController.get.all.forReport)
router.get('/get/all/:companyId', jwtServices.verifyToken.byHeader, journalRemarkController.get.all.all)

module.exports = {
    journalRemarkRouter: router
}