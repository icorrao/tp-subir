import mongoose from 'mongoose'

const libroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  genero: {
    type: String,
    required: true
  },
  autor: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
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
  editorial: {
    type: String,
    required: true
  },
  anioPublicacion: {
    type: Number,
    required: true
  },
  ISBN: {
    type: String
  },
  valoraciones: [{
    usuario: String,
    comentario: String,
    calificacion: Number
  }],
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});
libroSchema.index({ titulo: 'text', autor: 'text', editorial: 'text', descripcion: 'text' });
const Libro = mongoose.model('Libro', libroSchema);

export default Libro;
