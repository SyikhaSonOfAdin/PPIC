const { projectPlansController } = require('../controllers/projectPlans');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, projectPlansController.add)
router.post('/edit', jwtServices.verifyToken.byHeader, projectPlansController.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, projectPlansController.delete.onlyOne)
router.post('/delete-all', jwtServices.verifyToken.byHeader, projectPlansController.delete.all)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, projectPlansController.get)

module.exports = {
    projectPlansRouter: router
}