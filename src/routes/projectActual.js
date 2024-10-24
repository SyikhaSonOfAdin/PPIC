const { projectActualController } = require('../controllers/projectActual');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, projectActualController.add)
router.post('/edit', jwtServices.verifyToken.byHeader, projectActualController.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, projectActualController.delete.onlyOne)
router.post('/delete-all', jwtServices.verifyToken.byHeader, projectActualController.delete.all)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, projectActualController.get)

module.exports = {
    projectActualRouter: router
}