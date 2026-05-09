const multer = require("multer");
const path = require("path");
const XLSX = require("xlsx");

class Storage {
  constructor() {
    this.nameFile = "";
  }

  #memoryStorage = multer.memoryStorage();

  #excelFileFilter(req, file, cb) {
    const m = file.mimetype;
    if (
      m ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      m === "application/vnd.ms-excel" ||
      m === "application/wps-office.xlsx"
    ) {
      cb(null, true);
    } else {
      cb(null, false); // bukan Excel
    }
  }

  uploadExcel = multer({
    storage: this.#memoryStorage,
    fileFilter: this.#excelFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // batas 5MB
  }).single("file");

  #storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "../../../uploads/ppic"));
    },
    filename: (req, file, cb) => {
      this.nameFile = Date.now().toString() + "-" + file.originalname;
      cb(null, this.nameFile);
    },
  });

  storage = multer({ storage: this.#storage });

  parseExcel = {
    projectBulk: (req, res, next) => {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({
          success: false,
          message: "File Excel tidak terdeteksi atau salah field form",
        });
      }

      try {
        const workbook = XLSX.read(req.file.buffer, {
          type: "buffer",
        });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, {
          defval: null,
        });
        req.data = data;
        next();
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = Storage;
