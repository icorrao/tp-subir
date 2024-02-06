import mongoose from "mongoose"



let productosSchema= new mongoose.Schema({
    titulo:String,
    editorial:String,
    genero:String,
    nuevoPrecio:Number,
    viejoPrecio:Number,
    nuevoStock:Number,
    viejoStock:Number,
    codigo:Number,
    compania:Number,
    url:String,
    estadoActualizacion:String,



})

export default mongoose.model('productosAdmin',productosSchema)