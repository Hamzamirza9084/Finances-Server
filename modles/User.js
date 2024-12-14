import mongoose from 'mongoose';

const finances_adviserSchema= new mongoose.Schema({
    name: {type:String,required:true},
    email : {type:String,required:true,unique:true},
    password: {type:String,required:true}
})

const finances_advisermodel= mongoose.model("finances_adviser1",finances_adviserSchema)

export {finances_advisermodel as User} 