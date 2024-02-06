import ejs from "ejs";
import express from "express";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import flash from "connect-flash";
import session from "express-session";
import methodOverride from "method-override";
import passport  from "passport";
import morgan from "morgan";
import LocalStrategy  from 'passport-local';


//Routes
import formRouter from './routes/formulario.js'
import usuarios from './routes/usuarios.js'
// importar modelo
import Usuarios from './models/usuariosmodels.js'
import admin from './models/adminmodels.js'
//axios
import axios from 'axios'
//path
import  path  from "path";
//api
const API_KEY = process.env.API_KEY;
import { google } from 'googleapis';
import { datacatalog } from "googleapis/build/src/apis/datacatalog/index.js";
const client = google.books({ version: 'v1', auth: API_KEY }); // reemplazar x por tu api key
//
//mongoose
import mongoose from "mongoose";
dotenv.config({path:'./.env'})
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoCluster = process.env.MONGO_CLUSTER;
const mongoDatabase = process.env.MONGO_DATABASE;
mongoose.connect(`mongodb+srv://${mongoUser}:${mongoPassword}@${mongoCluster}/${mongoDatabase}?retryWrites=true&w=majority`)
.then(() => {
  console.log("conectado a mongodb")
}).catch((error) => {
  console.log(error)
})
//body parser
import bodyParser from "body-parser";
//schema de libros
import fs from "fs";



const app = express();



//middleware para sesiones
app.use(session({
  secret: 'se logeo en mi aplicacion',
  resave:true,
  saveUninitialized:true,
  
  
  }));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


// Configuración de la estrategia de autenticación para usuarios comunes
passport.use('user', new LocalStrategy({ usernameField: 'email' }, Usuarios.authenticate()));
passport.serializeUser(Usuarios.serializeUser());
passport.deserializeUser(Usuarios.deserializeUser());

// Configuración de la estrategia de autenticación para administradores
passport.use('admin', new LocalStrategy({ usernameField: 'email' }, admin.authenticate()));
passport.serializeUser(admin.serializeUser());
passport.deserializeUser(admin.deserializeUser());
//middleware flash mensajes


// configuracion de middlware
app.use( (req,res, next)=>{
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user ? req.user.nombre : null;
  res.locals.currentAdmin = req.user ? req.user.nombre : null;
    delete req.session.success_msg;
  delete req.session.error_msg;
  delete req.session.error;
next()

});

  



app.use(express.static('public'));
app.use('/node_modules', express.static('node_modules')); // Carpeta node_modules
app.use(bodyParser.urlencoded({extended:true})) //body parser
app.use(express.static('public'));

app.set('view engine', 'ejs')
//middleware for method override
app.use(methodOverride('_method'));





//rutas
app.use(formRouter)
app.use(usuarios)


app.get("/", (req, res) => {
  res.render('pages/index.ejs')
});


//importar schema
import Libro from './models/librosmodel.js';

// Función para obtener todos los libros para seccion compras
async function obtenerTodosLosLibros() {
  try {
    const libros = await Libro.find({});
    return libros.map((libro) => ({
      _id: libro._id,
      titulo: libro.titulo,
      autor: libro.autor,
      editorial: libro.editorial,
      imagen: libro.imagen,
      precio: libro.precio,
      stock: libro.stock,
      descripcion: libro.descripcion
    }));
  } catch (error) {
    throw new Error('Error en la obtención de libros');
  }
}

// Función para buscar libros en la base de datos por género
async function buscarLibrosPorGenero(genero) {
  try {
    const libros = await Libro.find({ genero: genero }).exec();
    return libros.map((libro) => ({
      _id: libro._id,
      titulo: libro.titulo,
      autor: libro.autor,
      editorial: libro.editorial,
      imagen: libro.imagen,
      precio: libro.precio,
      stock: libro.stock,
      descripcion: libro.descripcion,
    }));
  } catch (error) {
    throw new Error('Error en la búsqueda de libros');
  }
}
//BUSCADOR
async function buscarLibrosEnDB(query) {
  try {
    const libros = await Libro.find({ $text: { $search: query } });
    return libros.map((libro) => ({
      _id: libro._id,
      titulo: libro.titulo,
      autor: libro.autor,
      editorial: libro.editorial,
      imagen: libro.imagen,
      precio: libro.precio,
      stock: libro.stock,
      descripcion: libro.descripcion
    }));
  } catch (error) {
    throw new Error(`Error en la búsqueda de libros en la base de datos: ${error.message}`);
  }
}

//rutas
//mostrar todos los libros, click en comprar en el nav del header
app.get('/comprar', async (req, res) => {
  try {
    const libros = await obtenerTodosLosLibros();
    res.render('pages/partials/comprar', { libros });
  } catch (error) {
    console.error('Error en la obtención de libros:', error.message);
    res.render('error', { error: 'Error en la obtención de libros' });
  }
});
//BUSCAR
app.get('/buscar', async (req, res) => {
  try {
    const query = req.query.query;
    const libros = await buscarLibrosEnDB(query);
    res.render('pages/partials/busqueda', { libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});


//ficcion
app.get('/ficcion', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Ficción');
    res.render('pages/partials/librosficcion', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});

// Ruta para mostrar libros de "Humanidades"
app.get('/humanidades', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Humanidades');
    res.render('pages/partials/libroshumanidades', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
//arte
app.get('/arte', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Arte');
    res.render('pages/partials/librosarte', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
//infantiles
app.get('/infantiles', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Infantiles');
    res.render('pages/partials/librosinfantiles', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
//autoayuda
app.get('/autoayuda', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Autoayuda');
    res.render('pages/partials/librosautoayuda', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});




//mostrar todos los libros, click en comprar en el nav del header
app.get('/comprar', async (req, res) => {
  try {
    const libros = await obtenerTodosLosLibros();
    res.render('pages/partials/comprar', { books: libros });
  } catch (error) {
    console.error('Error en la obtención de libros:', error.message);
    res.render('error', { error: 'Error en la obtención de libros' });
  }
});


//ficcion
app.get('/ficcion', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Ficción');
    res.render('pages/partials/librosficcion', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
// Ruta para mostrar libros de "Humanidades"
app.get('/humanidades', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Humanidades');
    res.render('pages/partials/libroshumanidades', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
//arte
app.get('/arte', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Arte');
    res.render('pages/partials/librosarte', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
//infantiles
app.get('/infantiles', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Infantiles');
    res.render('pages/partials/librosinfantiles', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});
//autoayuda
app.get('/autoayuda', async (req, res) => {
  try {
    const libros = await buscarLibrosPorGenero('Autoayuda');
    res.render('pages/partials/librosautoayuda', { books: libros });
  } catch (error) {
    console.error('Error en la búsqueda de libros:', error.message);
    res.render('error', { error: 'Error en la búsqueda de libros' });
  }
});






app.listen(process.env.PUERTO, () => {
  console.log("servidor ejecutado");
});
