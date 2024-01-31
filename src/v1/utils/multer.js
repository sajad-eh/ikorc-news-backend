import multer from "multer";
import path from "path";
import os from "os";
import cryptoRandomString from "crypto-random-string";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    const fileName = cryptoRandomString({ length: 30 });
    cb(null, fileName + path.extname(file.originalname));
  },
});
const maxSize = 10 * 1024 * 1024;
export const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter(req, file, next) {
    const isImage = file.mimetype.startsWith("image/");
    if (isImage) {
      next(null, true);
    } else {
      next({ name: "MulterError", code: "error file type" }, false);
    }
  },
});
