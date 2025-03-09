const { attachmentControllers } = require('../controllers/attachment');
const { jwtServices } = require('../middlewares/jwt');
const Storage = require('../middlewares/storage');
const express = require('express');

const router = express.Router();
const storage = new Storage();

router.post('/add', storage.storage.single('file'), attachmentControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, attachmentControllers.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, attachmentControllers.delete.onlyOne)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, attachmentControllers.get)
router.get('/download/:fileName', jwtServices.verifyToken.byHeader, attachmentControllers.download)

module.exports = {
    attachmentRouter: router
}