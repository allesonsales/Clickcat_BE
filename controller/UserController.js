import User from "../models/Users.js";
import bcrypt from "bcrypt";
import createUserToken from "../helpers/create-user-token.js";
import getToken from "../helpers/get-token.js";
import logoutFunction from "../helpers/logout.js";
import jwt from "jsonwebtoken";

class UserController {
  static async criarUsuario(req, res) {
    try {
      const {
        nome,
        nomeUsuario,
        email,
        senha,
        confirmarSenha,
        foto,
        telefone,
      } = req.body;

      const camposObrigatorios = [
        { nome: "nome", valor: nome },
        { nome: "nomeUsuario", valor: nomeUsuario },
        { nome: "email", valor: email },
        { nome: "senha", valor: senha },
        { nome: "confirmarSenha", valor: confirmarSenha },
        { nome: "telefone", valor: telefone },
      ];

      for (let campo of camposObrigatorios) {
        if (!campo.valor) {
          return res
            .status(422)
            .json({ message: `O campo de ${campo.nome} é obrigatório` });
        }
      }

      if (senha !== confirmarSenha) {
        return res
          .status(422)
          .json({ message: "As senhas precisam ser iguais!" });
      }

      const usuarioEncontrado = await User.findOne({ email: email });

      const nomeUsuarioEncontrado = await User.findOne({
        nomeUsuario: nomeUsuario,
      });

      const telefoneEncontrado = await User.findOne({
        telefone: telefone,
      });

      if (telefoneEncontrado) {
        return res
          .status(422)
          .json({ message: "Telefone já cadastrado no sistema." });
      }

      if (nomeUsuarioEncontrado) {
        return res
          .status(422)
          .json({ message: "Nome de usuário já cadastrado no sistema." });
      }

      if (usuarioEncontrado) {
        return res
          .status(451)
          .json({ message: "E-mail já cadastrado no sistema." });
      }

      const salt = await bcrypt.genSalt(12);
      const senhaHash = await bcrypt.hash(senha, salt);

      const usuario = new User({
        nome,
        nomeUsuario,
        email,
        senha: senhaHash,
        foto,
        telefone,
      });

      const newUser = await usuario.save();

      await createUserToken(newUser, req, res);
    } catch (error) {
      return res.status(400).json({ message: "Erro ao criar usuário" });
    }
  }

  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      const usuarioEncontrado = await User.findOne({ email: email });

      if (!usuarioEncontrado) {
        return res.status(401).json({ message: "E-mail não cadastrado" });
      }

      const senhaHash = usuarioEncontrado.senha;

      const matchSenha = await bcrypt.compareSync(senha, senhaHash);

      if (!matchSenha) {
        return res.status(401).json({
          message: "A senha digitada e a senha cadastrada são diferentes",
        });
      }

      createUserToken(usuarioEncontrado, req, res);
    } catch (err) {
      console.error("erro no login", err);
    }
  }

  static async buscandoUsuarioId(req, res) {
    try {
      const id = req.params.id;

      const usuario = await User.findById(id).select("-senha");

      if (!usuario) {
        return res.status(400).json({ message: "Usuário não encontrado!" });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao buscar usuário!" });
    }
  }

  static async editarPerfil(req, res) {
    try {
      const id = req.params.id;
      let { foto, telefone, nomeUsuario } = req.body;

      if (req.file) {
        foto = req.file.filename;
      }

      const dadosAtualizados = { foto, telefone, nomeUsuario };

      const usuarioEncontrado = await User.findById(id);

      if (!usuarioEncontrado) {
        return res.status(422).json({ message: "Usuário não encontrado!" });
      }

      const usuarioAtualizado = await User.updateOne(
        { _id: id },
        dadosAtualizados
      );

      return res.status(200).json({ message: "Perfil foi atualizado!" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao atualizar perfil!" });
    }
  }

  static async configuracoesPerfil(req, res) {
    try {
      const id = req.params.id;

      const {
        emailAntigo,
        novoEmail,
        confirmarNovoEmail,
        novaSenha,
        confirmarNovaSenha,
        senhaAntiga,
      } = req.body;

      const usuario = await User.findById(id);

      if (emailAntigo) {
        try {
          const matchEmail = await User.findOne({ email: emailAntigo });

          if (!matchEmail) {
            return res.status(422).json({ message: "E-mail não encontrado!" });
          }
          const usuarioEncontrado = await User.findOne({ email: novoEmail });

          const dadosAtualizados = {
            emailAntigo,
            novoEmail,
            confirmarNovoEmail,
          };

          if (usuarioEncontrado) {
            return res
              .status(422)
              .json({ message: "O email já está em uso, tente novamente!" });
          }

          await User.updateOne({ _id: id }, dadosAtualizados);

          return res.status(200).json({
            message: "E-mail atualizado com sucesso!",
          });
        } catch (error) {
          console.error(error);
        }
      }

      if (novaSenha) {
        const senhaMatch = await bcrypt.compare(senhaAntiga, usuario.senha);
        if (!senhaMatch) {
          return res.status(422).json({
            message:
              "A sua senha antiga não bate com a senha cadastrada em nosso banco de dados!",
          });
        }

        if (novaSenha !== confirmarNovaSenha) {
          return res
            .status(422)
            .json({ message: "As senhas digitadas não conferem!" });
        }

        const salt = await bcrypt.genSalt(12);
        const senhaHash = await bcrypt.hash(novaSenha, salt);

        const dadosAtualizados = { senha: senhaHash };

        await User.updateOne({ _id: id }, dadosAtualizados);

        return res.status(200).json({
          message: "Senha atualizada com sucesso!",
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  static async excluirPerfil(req, res) {
    try {
      const { senha, id } = req.body;

      const usuario = await User.findById(id);

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      const matchSenha = await bcrypt.compare(senha, usuario.senha);

      if (!matchSenha) {
        return res
          .status(422)
          .json({ message: "A senha digitada não confere com a do usuário!" });
      }

      await User.deleteOne({ _id: id });

      return res
        .status(200)
        .json({ message: "Sua conta foi excluída com sucesso!" });
    } catch (err) {
      console.error(err);
    }
  }

  static async checkUsuario(req, res) {
    try {
      let usuarioLogado;

      console.log(req.headers.authorization);

      if (req.headers.authorization) {
        const token = getToken(req);
        const decoded = jwt.verify(token, "segredo");

        const id = decoded.id;

        usuarioLogado = await User.findById(id);

        usuarioLogado.senha = undefined;
      } else {
        usuarioLogado = null;
      }

      return res.status(200).send(usuarioLogado);
    } catch (err) {
      console.log(err);
      return res.status(422).json({ message: "Erro ao autenticar" });
    }
  }

  static async buscarUsuario(req, res) {
    const usuarioAtual = await User.findById(req.user.id).select("-password");

    if (!usuarioAtual) {
      console.log("Usuário não encontrado");
      return res.status(401).json({ message: "Usuário não encontrado!" });
    }

    return res.status(200).json({ user: usuarioAtual, message: "Autenticado" });
  }
}

export default UserController;
