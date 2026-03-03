const { attachmentControllers } = require('../controllers/attachment');
const { jwtServices } = require('../middlewares/jwt');
const { privilege } = require('../middlewares/privilege');
const Storage = require('../middlewares/storage');
const express = require('express');

const router = express.Router();
const storage = new Storage();

router.post('/add', jwtServices.verifyToken.byHeader, storage.storage.single('file'), attachmentControllers.add)
router.post('/edit', jwtServices.verifyToken.byHeader, attachmentControllers.edit)
router.post('/delete-one', jwtServices.verifyToken.byHeader, privilege.hasPrivilege('019983c4-60d6-788c-8485-7469d8332169'), attachmentControllers.delete.onlyOne)
router.get('/get/:projectId', jwtServices.verifyToken.byHeader, attachmentControllers.get)
router.get('/download/:attachmentId', jwtServices.verifyToken.byHeader, attachmentControllers.download)

module.exports = {
    attachmentRouter: router
}