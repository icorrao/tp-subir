import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

let adminSchema = new mongoose.Schema ({
    nombre:String,
    email:String,
    password:{
        type:String,
        select:false
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,

})
adminSchema.plugin(passportLocalMongoose, {usernameField : 'email'});

export default mongoose.model('admin', adminSchema)
