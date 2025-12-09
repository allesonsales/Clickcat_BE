import mongoose from "mongoose";
import { Schema } from "mongoose";

const User = mongoose.model(
  "User",
  new Schema(
    {
      nome: { type: String, required: true },
      nomeUsuario: { type: String, required: true },
      email: { type: String, required: true },
      senha: { type: String, required: true },
      foto: { type: String, required: false },
      telefone: { type: String, required: true },
      user: Object,
      adotante: Object,
    },
    { timestamps: true }
  )
);

export default User;
