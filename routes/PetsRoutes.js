import express from "express";
import PetController from "../controller/PetsController.js";
import checkToken from "../helpers/verify-token.js";
import imageUpload from "../helpers/image-upload.js";
const router = express.Router();

router.post(
  "/cadastrar",
  checkToken,
  imageUpload("fotos"),
  PetController.cadastrarPet
);
router.get("/", PetController.listarPets);
router.get("/meuspets", checkToken, PetController.listarMeusPets);
router.get("/minhasadocoes", checkToken, PetController.listarMinhasAdocoes);
router.put("/concluir/:id", checkToken, PetController.concluirAdocao);
router.patch(
  "/:id",
  checkToken,
  imageUpload.array("fotos"),
  PetController.editarPet
);
router.get("/:id", PetController.listarPet);
router.delete("/:id", checkToken, PetController.excluirPet);
router.patch("/agendar/:id", checkToken, PetController.agendarVisita);

export default router;
