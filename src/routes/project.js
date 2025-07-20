const { projectControllers } = require('../controllers/project');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, projectControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, projectControllers.edit.all)
router.post('/edit/d/deliver', jwtServices.verifyToken.byHeader, projectControllers.edit.deliver)
router.post('/delete', jwtServices.verifyToken.byHeader, projectControllers.delete)
router.get('/get/:companyId', jwtServices.verifyToken.byHeader, projectControllers.get.all)
router.get('/get/:companyId/:projectId', jwtServices.verifyToken.byHeader, projectControllers.get.onlyOne)
router.get('/get/s/d/:companyId', jwtServices.verifyToken.byHeader, projectControllers.get.summary)

module.exports = {
    projectRouter: router
}