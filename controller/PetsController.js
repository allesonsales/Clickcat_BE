import { isValidObjectId } from "mongoose";
import Pet from "../models/Pet.js";
import User from "../models/Users.js";
import getToken from "../helpers/get-token.js";

class PetController {
  static async cadastrarPet(req, res) {
    try {
      const id = req.user.id;

      const usuario = await User.findById(id);

      let { nome, idade, tipo, peso, cor, temperamento, historia } = req.body;

      const fotos = req.files;

      const camposObrigatorios = [
        { nome: "nome", valor: nome },
        { nome: "idade", valor: idade },
        { nome: "tipo", valor: tipo },
        { nome: "peso", valor: peso },
        { nome: "cor", valor: cor },
      ];

      for (let campo of camposObrigatorios) {
        if (campo.valor == null) {
          return res
            .status(422)
            .json({ message: `O campo de ${campo.nome} é obrigatório!` });
        }
      }

      const adotado = false;

      const dados = {
        nome,
        idade,
        tipo,
        peso,
        cor,
        fotos: [],
        temperamento: JSON.parse(temperamento),
        historia,
        adotado,
        usuario: {
          _id: id,
          nome: usuario.nome,
          foto: usuario.foto,
          telefone: usuario.telefone,
        },
      };

      for (let foto of fotos) {
        dados.fotos.push(foto.filename);
      }

      const pet = new Pet(dados);

      await pet.save();

      return res.status(201).json({ message: "Pet cadastrado com sucesso!" });
    } catch (err) {
      console.error("Erro ao cadastrar pet:", err);
      return res.status(400).json({ message: "Erro ao cadastrar pet!" });
    }
  }

  static async listarPets(req, res) {
    try {
      const pets = await Pet.find({ adotado: false }).sort("createdAt");
      return res.status(200).json(pets);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao buscar pets!" });
    }
  }

  static async listarPet(req, res) {
    try {
      const id = req.params.id;

      if (!isValidObjectId(id)) {
        return res
          .status(404)
          .json({ message: "Erro ao buscar pet! O pet não existe!" });
      }

      const pet = await Pet.findById(id);

      return res.status(200).json(pet);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao buscar pet!" });
    }
  }

  static async listarMeusPets(req, res) {
    try {
      const userId = req.user.id;

      const pets = await Pet.find({ "usuario._id": userId }).sort("-createdAt");

      return res.status(200).json(pets);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: "Erro ao buscar Pets!" });
    }
  }

  static async concluirAdocao(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const pet = await Pet.findById(id);

      if (!pet) {
        return res.status(404).json({ message: "O pet não foi encontrado!" });
      }

      if (pet.usuario._id.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "O pet pertence a outro usuário!" });
      }

      if (!pet.adotante) {
        return res
          .status(403)
          .json({ message: "O adotante não foi encontrado!" });
      }

      const dados = { adotado: true, adotante: pet.adotante };

      await Pet.updateOne({ _id: id }, dados);

      return res
        .status(200)
        .json({ message: `Parabéns, o(a) ${pet.nome} foi adotado(a)!` });
    } catch (err) {
      console.error(err);
      return res.status(422).json({ message: "Erro ao adotar!" });
    }
  }

  static async listarMinhasAdocoes(req, res) {
    try {
      const userId = req.user.id;

      const pets = await Pet.find({ "adotante.id": userId }).sort("nome");

      return res.status(200).json(pets);
    } catch (err) {
      console.error(err);
    }
  }

  static async editarPet(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user.id;

      const fotos = req.files;

      const { nome, idade, tipo, peso, cor } = req.body;

      const pet = await Pet.findById(id);

      if (!pet) {
        return res.status(404).json({ message: "Pet não encontrado" });
      }

      const dados = { nome, idade, tipo, peso, cor, fotos: [] };

      if (pet.usuario._id.toString() !== userId.toString()) {
        return res
          .status(403)
          .json("O pet não pertence ao usuário cadastrado!");
      }

      if (req.files && req.files.length > 0) {
        for (let foto of req.files) {
          dados.fotos.push(foto.filename);
        }
      } else {
        dados.fotos = pet.fotos;
      }

      await Pet.updateOne({ _id: id }, dados);

      return res.status(200).json({ message: "Pet atualizado com sucesso" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao atualizar pet!" });
    }
  }

  static async excluirPet(req, res) {
    try {
      const id = req.params.id;
      const userId = req.user.id;

      const pet = await Pet.findById(id);

      if (pet.usuario._id.toString() !== userId.toString()) {
        return res
          .status(403)
          .json({ message: "O pet não pertence ao usuário cadastrado!" });
      }

      await Pet.deleteOne({ _id: id });

      return res.status(200).json({ message: "Pet excluído com sucesso!" });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: "Erro ao excluir Pet!" });
    }
  }

  static async agendarVisita(req, res) {
    const id = req.params.id;
    const userId = req.user.id;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({ message: "O pet não foi encontrado!" });
    }

    if (pet.usuario._id.toString() == userId.toString()) {
      return res.status(403).json({
        message:
          "O Pet cadastrado é seu, não da pra você mesmo adotar o seu pet!",
      });
    }

    if (pet.adotante) {
      if (pet.adotante._id === userId) {
        return res
          .status(422)
          .json({ message: "Você já agendou uma visita para este pet!" });
      }
    }

    pet.adotante = {
      _id: userId,
      nome: req.user.nome,
      foto: req.user.foto,
    };

    await Pet.updateOne({ _id: id }, pet);

    return res.status(200).json({
      message: `A visita foi agendada com sucesso, entre em contato com ${pet.usuario.nome}, pelo telefone: ${pet.usuario.telefone}`,
    });
  }
}

export default PetController;
