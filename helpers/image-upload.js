import multer from "multer";
import path from "path";

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let pasta = "";

    if (req.baseUrl.includes("pets")) {
      pasta = "pets";
    } else if (req.baseUrl.includes("user")) {
      pasta = "users";
    }

    cb(null, `public/images/${pasta}`);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        String(Math.floor(Math.random() * 100)) +
        path.extname(file.originalname)
    );
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error(`Envie apenas jpg ou png`));
    }
    cb(undefined, true);
  },
});

export default imageUpload;
