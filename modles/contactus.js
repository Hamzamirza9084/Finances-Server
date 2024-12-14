import mongoose from 'mongoose';

const contactusSchema= new mongoose.Schema({
    name: {type:String,required:true},
    email : {type:String,required:true,unique:true},
    message: {type:String,required:true}
})

const contactusmodel= mongoose.model("contactus1",contactusSchema)

export {contactusmodel as Contactus} 