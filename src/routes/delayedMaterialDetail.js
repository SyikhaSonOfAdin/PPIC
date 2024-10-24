const { delayedMaterialListDetailController } = require('../controllers/delayedMaterialDetail');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, delayedMaterialListDetailController.add)
router.post('/edit', jwtServices.verifyToken.byHeader, delayedMaterialListDetailController.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, delayedMaterialListDetailController.delete.onlyOne)
router.post('/delete-all', jwtServices.verifyToken.byHeader, delayedMaterialListDetailController.delete.all)
router.get('/get/:delayedListId', jwtServices.verifyToken.byHeader, delayedMaterialListDetailController.get)

module.exports = {
    delayedMaterialListDetailRouter: router
}