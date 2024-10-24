const { privilegeController } = require('../controllers/privilege');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, privilegeController.add)
router.post('/delete', jwtServices.verifyToken.byHeader, privilegeController.delete.onlyOne)

module.exports = {
    privilegeRouter: router
}