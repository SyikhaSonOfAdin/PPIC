const { permissionController } = require('../controllers/permission');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const { privilege } = require('../middlewares/privilege');
const router = express.Router();

router.get('/get', jwtServices.verifyToken.byHeader, privilege.hasPrivilege("01987858-ad48-711f-a641-d2a7727d9881"), permissionController.get)
router.post('/add', jwtServices.verifyToken.byHeader, permissionController.add)

module.exports = {
    permissionRouter: router
}