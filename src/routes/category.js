const { categoryControllers } = require('../controllers/category');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const { privilege } = require('../middlewares/privilege');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987841-c0fd-711f-a641-86bba7f98f91'), categoryControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987841-ee16-711f-a641-8d15ee399683'), categoryControllers.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('01987842-21b7-711f-a641-9585d764edd0'), categoryControllers.delete.onlyOne)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, categoryControllers.get.all)
router.get('/get/:companyId/:categoryId', jwtServices.verifyToken.byHeader, categoryControllers.get.detail)

module.exports = {
    categoryRouter: router
}