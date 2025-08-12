const { workLoadControllers } = require('../controllers/workLoad');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const { privilege } = require('../middlewares/privilege');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987843-111e-711f-a641-9c85b4eb5a18'), workLoadControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987843-569b-711f-a641-a1d18647f5c5'), workLoadControllers.edit)
router.post('/delete', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987843-837b-711f-a641-a8be13dfaf59'), workLoadControllers.delete.onlyOne)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, workLoadControllers.get)

module.exports = {
    workLoadRouter: router
}