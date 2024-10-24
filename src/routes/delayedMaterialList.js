const { delayedMaterialListController } = require('../controllers/delayedMaterialList');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, delayedMaterialListController.add)
router.post('/edit', jwtServices.verifyToken.byHeader, delayedMaterialListController.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, delayedMaterialListController.delete.onlyOne)
router.post('/delete-all', jwtServices.verifyToken.byHeader, delayedMaterialListController.delete.all)
router.get('/get/:delayId', jwtServices.verifyToken.byHeader, delayedMaterialListController.get)

module.exports = {
    delayedMaterialListRouter: router
}