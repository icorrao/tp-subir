import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

let usuariosSchema = new mongoose.Schema ({
    nombre:String,
    email:String,
    password:{
        type:String,
        select:false
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,

})
usuariosSchema.plugin(passportLocalMongoose, {usernameField : 'email'});

export default mongoose.model('Usuarios', usuariosSchema)
