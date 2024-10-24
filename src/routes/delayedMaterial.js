const { delayedMaterialController } = require('../controllers/delayedMaterial');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, delayedMaterialController.add)
router.post('/edit', jwtServices.verifyToken.byHeader, delayedMaterialController.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, delayedMaterialController.delete.onlyOne)
router.post('/delete-all', jwtServices.verifyToken.byHeader, delayedMaterialController.delete.all)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, delayedMaterialController.get)

module.exports = {
    delayedMaterialRouter: router
}