import express from "express";
import UserController from "../controller/UserController.js";
import verifyToken from "../helpers/verify-token.js";
import imageUpload from "../helpers/image-upload.js";
import logoutFunction from "../helpers/logout.js";

const router = express.Router();

router.get("/check", verifyToken, (req, res) => {
  res.status(200).json({ user: req.user });
});
router.post("/logout", logoutFunction);
router.post("/cadastrar", UserController.criarUsuario);
router.get("/login", UserController.checkUsuario);
router.post("/login", UserController.login);
router.get("/:id", UserController.buscandoUsuarioId);
router.patch(
  "/editar/:id",
  verifyToken,
  imageUpload.single("foto"),
  UserController.editarPerfil
);
router.patch(
  "/editar/configuracoes/:id",
  verifyToken,
  UserController.configuracoesPerfil
);
router.delete("/excluir/", verifyToken, UserController.excluirPerfil);

export default router;
