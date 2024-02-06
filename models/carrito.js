import mongoose from 'mongoose'

const carritoSchema = new mongoose.Schema({

  titulo: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  imagen: {
    type: String,
    required: true
  },
  stock:{
    type: Number,
    required: true
  },
  emailUsuario: {
    type: String,
    required: true
  },
});

const carrito = mongoose.model('carrito', carritoSchema);

export default carrito;
