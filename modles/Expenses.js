import mongoose from 'mongoose';

const expenses= new mongoose.Schema({
    name: {type:String,required:true},
    expenses: {type:Number,required:true},
    email : {type:String,required:true},
    date: {type:Date,required:true},
    cat: {type:String,required:true},
    type: {type:String,required:true}
})

const expensesmodel= mongoose.model("expenses",expenses)

export {expensesmodel as Expenses} 