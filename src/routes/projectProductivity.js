const { projectProductivityController } = require('../controllers/projectProductivity');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, projectProductivityController.add)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, projectProductivityController.get.by.companyId)
router.get('/get/:companyId/:projectId', jwtServices.verifyToken.byHeader, projectProductivityController.get.by.projectId)

module.exports = {
    projectProductivityRouter: router
}