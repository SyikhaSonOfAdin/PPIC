const { permissionController } = require('../controllers/permission');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.get('/get', jwtServices.verifyToken.byHeader, permissionController.get)

module.exports = {
    permissionRouter: router
}