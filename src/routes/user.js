const express = require('express');
const { userControllers } = require('../controllers/user');
const { jwtServices } = require('../middlewares/jwt');
const router = express.Router();

router.post('/login', userControllers.login)
router.post('/add', jwtServices.verifyToken.byHeader, userControllers.add)
router.post('/delete', jwtServices.verifyToken.byHeader, userControllers.delete)

module.exports = {
    userRouter: router
}