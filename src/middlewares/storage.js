const multer = require('multer');
const path = require('path');

class Storage {
    constructor() {
        this.nameFile = '';
    }

    #storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../../../uploads/ppic'));
        },
        filename: (req, file, cb) => {
            this.nameFile = Date.now().toString() + '-' + file.originalname;
            cb(null, this.nameFile);
        },
    });

    storage = multer({ storage: this.#storage });
}

module.exports = Storage;
