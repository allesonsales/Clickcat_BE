import mongoose, { Schema } from "mongoose";

const Pet = mongoose.model(
  "Pet",
  new Schema(
    {
      nome: { type: String, required: true },
      idade: { type: Number, required: false },
      tipo: { type: Number, required: true },
      peso: { type: Number, required: true },
      cor: { type: String, required: true },
      fotos: { type: [String], required: false },
      temperamento: { type: [String], required: true },
      historia: { type: String, required: true },
      adotado: { type: Boolean, required: true },
      usuario: Object,
      adotante: Object,
    },
    { timestamps: true }
  )
);

export default Pet;
