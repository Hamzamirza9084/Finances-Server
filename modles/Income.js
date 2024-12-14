import mongoose from 'mongoose';

const income= new mongoose.Schema({
    name: {type:String,required:true},
    income: {type:Number,required:true},
    email : {type:String,required:true},
    date: {type:Date,required:true},
    cat: {type:String,required:true},
    type: {type:String,required:true}
})

const incomemodel= mongoose.model("income",income)

export {incomemodel as Income} 