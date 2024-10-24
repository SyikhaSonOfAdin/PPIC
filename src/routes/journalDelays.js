const { journaleDelaysControllers } = require('../controllers/journalDelays');
const { jwtServices } = require('../middlewares/jwt');
const express = require('express');
const router = express.Router();

router.post('/add', jwtServices.verifyToken.byHeader, journaleDelaysControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, journaleDelaysControllers.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, journaleDelaysControllers.delete.onlyOne)
router.post('/delete-all', jwtServices.verifyToken.byHeader, journaleDelaysControllers.delete.all)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, journaleDelaysControllers.get)

module.exports = {
    journalDelaysRouter: router
}