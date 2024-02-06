import express from 'express'
import nodemailer from 'nodemailer'
import Libros from '../models/librosmodel.js';
import Carrito from '../models/carrito.js';
const router=express.Router()

 // Función para contar la cantidad de libros en el carrito
 async function contarLibrosEnCarrito() {
  try {
    const cantidad = await Carrito.countDocuments();
    return cantidad;
  } catch (error) {
    console.error(error);
    return 0;
  }
}
// Checks if user is authenticated
function isAuthenticatedUser(req, res, next) {
  if(req.isAuthenticated()) {
      return next();
  }
  req.flash('error_msg', 'Por favor inicie sesión.')
  res.redirect('/login');
}

// Get del footer
router.get("/politicas",(req,res)=>{
   res.render('pages/footer/politicas.ejs')


})
//Get del formulario
router.get('/enviar-correo',(req,res)=>{
  try {
   // const cantidadLibrosEnCarrito = contarLibrosEnCarrito(); 

    res.render('pages/correo/correo');
  } catch (error) {
    console.error(error);
  
  }
  
})


//Post formulario
router.post('/enviar-correo', async(req, res) => {
    const {nombre, email, mensaje} = req.body; 
    console.log(email)
  
    // Transporte de Nodemailer, envía el correo electrónico
  
    const transporter = nodemailer.createTransport({
      
      // Configuración del servidor SMTP
      service: 'Gmail',
      auth:{
      user: process.env.CORREO_USER,
      pass: process.env.CORREO_PASS,
      },
  });
  // Opciones del correo electrónico
    const mailOptions = {
        from:'',
        to:'diegocolman14@gmail.com',
        subjet:'nuevo mensaje de contacto ',
        text:`${mensaje}`,
        
     };
  
  
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        req.flash('error_msg','Error al enviar el correo electrónico');
      } else {
        console.log('Correo electrónico enviado: ' + info.response);
        req.flash('success_msg','Correo electrónico enviado correctamente');
       res.redirect('/')
      }
      
    });
  });


// Ruta para mostrar la página principal
router.get('/', async (req, res) => {
  try {
    const libros = await Libros.find({});
    const cantidadLibrosEnCarrito = await contarLibrosEnCarrito();
    console.log(cantidadLibrosEnCarrito)
    res.render('pages/index', { libros, cantidadLibrosEnCarrito });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al obtener los libros');
    res.redirect('/');
  }
});


// Ruta para agregar un libro al carrito
router.post('/agregar-al-carrito',isAuthenticatedUser, async (req, res) => {
  try {
    const emailUsuario = req.user.email
    const libroId = parseInt(req.body.id);
    const carritoItem = new Carrito({
      emailUsuario: emailUsuario,
      id: libroId,
      titulo: req.body.titulo,
      stock: req.body.stock,
      precio: parseInt(req.body.precio),
      imagen: req.body.imagen,
     
    });
    console.log(emailUsuario)
     await carritoItem.save();

    console.log('Libro agregado al carrito');
    req.flash('success_msg', 'Libro agregado al carrito correctamente');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al agregar el libro al carrito');
  }

  res.redirect('/');
});





// Ruta para mostrar el carrito de compras
router.get('/carrito', async (req, res) => {
  if (!req.isAuthenticated()) {
   
    res.redirect('/login');
    return;
  }

  const emailUsuario = req.user.email; 

  try {
    // Consulta los elementos del carrito asociados con el correo electrónico del usuario
    const carritoItems = await Carrito.find({ emailUsuario: emailUsuario });

    let total = 0;
    for (const producto of carritoItems) {
      total += producto.precio;
    }

    res.render('pages/partials/carrito', { carrito: carritoItems, total });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al obtener el carrito de compras');
    res.redirect('/');
  }
});


router.delete('/carrito/eliminar/:id', async (req, res) => {
  
    let productoId = {_id : req.params.id};
    console.log(productoId)
    Carrito.deleteOne(productoId ) 
    .then(user=> {
      req.flash('success_msg', 'Usuario eliminado exitosamente.');
      res.redirect('/carrito');
  })
  .catch(err => {
      req.flash('error_msg', 'ERROR: '+err);
      res.redirect('/carrito');
  })
    
});
// Ruta para mostrar los detalles de un libro
router.get('/libro/:id', async (req, res) => {
  try {
    const libroId = req.params.id;
    const libro = await Libros.findById(libroId);

    res.render('pages/libros/descripcionLibros', { libro });
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al obtener los detalles del libro');
    res.redirect('/');
  }
});









  export default router