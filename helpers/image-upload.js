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

const multerInstance = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpe?g)$/i)) {
      return cb(new Error("Envie apenas arquivos jpg ou png"));
    }
    cb(null, true);
  },
});

const imageUpload =
  (fieldName, maxCount = 10) =>
  (req, res, next) => {
    const upload = multerInstance.array(fieldName, maxCount);

    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ message: "Envie pelo menos uma imagem válida (jpg ou png)" });
      }

      next();
    });
  };

export default imageUpload;
