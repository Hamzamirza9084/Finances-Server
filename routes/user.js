import express from 'express';
import bcrypt from 'bcryptjs';
const router =express.Router();
import { User } from '../modles/User.js';
import { Admin } from '../modles/Admin.js';
import { Contactus } from '../modles/contactus.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {Income} from '../modles/Income.js';
import {Expenses} from '../modles/Expenses.js';
import { GoalModel } from '../modles/Goal.js';


router.post('/signup', async(req,res)=>{
    const{name,email,password,cpassword} =req.body;
    const user=await User.findOne({email})
    if(user)
    {
        return res.json({message:"user already existed"})
    }

     try{
        const hashpassword = await bcrypt.hash(password,10)
        const newUser =new User({
          name,
          email,
          password: hashpassword,
      })
      await newUser.save()
    }
    catch(err)
      {
        console.error("Error hashing password:", err);
        return res.status(500).json({ message: "Server error while hashing password" });
      }

    return res.json({status:true ,message :"record registed"})
    
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in database
    const user = await User.findOne({ email });
    
    // If user not found
    if (!user) {
      return res.json({ status: false, message: "user is not registered" });
    }

    // Check if password matches (you can hash and compare passwords if needed)
    if (user.password !== password) {
      return res.json({ status: false, message: "password is incorrect" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id },  // Payload with user data
      process.env.KEY,                       // Secret key for signing the token
      { expiresIn: '1h' }                    // Token expiration (optional)
    );

    // Set the token in cookies (httpOnly ensures it's not accessible via JS)
    res.cookie("token", token, {
      httpOnly: true,       // Prevent access via JavaScript
      secure: process.env.NODE_ENV === "production",  // Secure flag (HTTPS only in production)
      maxAge: 3600000       // Optional: Token expiry (1 hour in ms)
    });

    // Send success response
    return res.json({ status: true, message: "Login successful" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.post('/forget',async (req,res)=>{
    const {email} =req.body;
    try
    {
        const user = await User.findOne({email})
        if(!user)
        {
            return res.json({message:"user not registered"})
        }

        const token=jwt.sign({ id: user._id}, process.env.KEY, { expiresIn: '5m' })
        
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'hamzamirzaop786@gmail.com',
              pass: 'nhaj ddyh frgh iitj'
            }
          });
          
          var mailOptions = {
            from: 'hamzamirzaop786@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `http://localhost:5173/reset/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              return res.json({message:"error sending email"})
            } else {
              return res.json({status:true ,message:"email sent"+ info.response})
            }
          });
    }
    catch(err)
    {
        console.log(err)
    }
})


router.post('/reset/:token',async (req,res)=>{
  const {token} = req.params;
  const {password} =req.body
  try{
    const decoded =await jwt.verify(token,process.env.KEY);
    const id=decoded.id;
    const hashpassword=await bcrypt.hash(password,10)
    await User.findByIdAndUpdate({_id:id},{password:hashpassword})
    return res.json({status:true ,message:"Update Password"})
  }
  catch (err) {
    return res.json("invaild token ")
  }
})

const verifyUser = async (req,res,next) =>{
  try {
    const token = req.cookies.token;
    if(!token)
    {
      return res.json({status:false,message : "no token "})
    }
    const decoded = jwt.verify(token,process.env.KEY);
    req.user=decoded
    next();
  
  }catch(err)
    {
      return res.json(err);
  }
  }

router.get('/verify',verifyUser,(req,res)=>{
  const userEmail = req.user.email;
    return res.json({status:true ,message:"authorized",email:userEmail})
})

router.get('/home',verifyUser,(req,res)=>{
  const userEmail = req.user.email;
    return res.json({status:true ,message:"authorized",email:userEmail})
})

router.get('/logout',(req,res)=>{
  res.clearCookie('token')
  return res.json({status:true}) 
})

router.post('/income',verifyUser,async(req,res)=>{
  const email = req.user.email;
  const{name,income,date,cat,type} =req.body;
  
  const newIncome =new Income({
      name,
      income,
      email,
      date,
      cat,
      type,
  })

  await newIncome.save()
  return res.json({status:true ,message :"Income added"})
})

router.post('/expenses',verifyUser,async(req,res)=>{
  const email = req.user.email;
  const{name,expenses,date,cat,type} =req.body;
  
  const newExpenses =new Expenses({
      name,
      expenses,
      email,
      date,
      cat,
      type,
  })

  await newExpenses.save()
  return res.json({status:true ,message :"Expenses added"})
})


router.get('/expensesinfo',verifyUser,async(req,res)=>{
  try {
    const email = req.user.email;
    const user=await Expenses.find({email})
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.post('/contactus',async(req,res)=>{
  const{name,email,message} =req.body;
   try{
      const newContactus =new Contactus({
        name,
        email,
        message,
    })
    await newContactus.save()
  }
  catch(err)
    {
      console.error("Error:", err);
      return res.status(500).json({ message: "Server error while" });
    }

  return res.json({status:true ,message :"record"})
  
})

router.put('/expensesinfo/:id', verifyUser, async (req, res) => {
  try {
    const { name, expenses, date, cat, type } = req.body;
    const updatedExpense = await Expenses.findByIdAndUpdate(
      req.params.id,
      { name, expenses, date, cat, type },
      { new: true }
    );
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/expensesinfo/:id', verifyUser, async (req, res) => {
  try {
    await Expenses.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/incomeinfo/:id', verifyUser, async (req, res) => {
  try {
    const { name, income, date, cat, type } = req.body;
    const updatedExpense = await Income.findByIdAndUpdate(
      req.params.id,
      { name, income, date, cat, type },
      { new: true }
    );
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/incomeinfo/:id', verifyUser, async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.params.id);
    res.json({ message: "Income deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/incomeinfo',verifyUser,async(req,res)=>{
  try {
    const email = req.user.email;
    const user=await Income.find({email})
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.post('/admin', async(req, res) => {
  const { name, password } = req.body;


  const user1 = await Admin.findOne({ name });
  const password1 =await Admin.findOne({ password });
  if (!user1) {
    return res.json({ message: "user is not registered" });
  }

 
  if (!password1) {
    return res.json({ message: "password is incorrect" });
  }


  const token = jwt.sign({ name: user1.name }, process.env.KEY, { expiresIn: '1h' });
  

  res.cookie('token', token, { httpOnly: true, maxAge: 10800000 }); 
  
  return res.json({ status: true, message: "Admin login successfully" });
});


const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token; 
    if (!token) {
      return res.json({ status: false, message: "no token" });
    }
    const decoded = jwt.verify(token, process.env.KEY);
    req.user1 = decoded; 
    next();
  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
};

router.get('/verifyadmin',verifyAdmin,(req,res)=>{
  const Adminname = req.user1.name;
    return res.json({status:true ,message:"authorized",name:Adminname})
})

router.get('/adminlogout',(req,res)=>{
  res.clearCookie('token')
  return res.json({status:true}) 
})

router.get('/admininfo',async(req,res)=>{
  try {
    const user=await User.find({})
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.get('/balance', verifyUser, async (req, res) => {
  const email = req.user.email;
  try {
      const incomes = await Income.find({ email });
      const expenses = await Expenses.find({ email });

      const totalIncome = incomes.reduce((acc, income) => acc + income.income, 0);
      const totalExpenses = expenses.reduce((acc, expense) => acc + expense.expenses, 0);
      const balance = totalIncome - totalExpenses;

      return res.json({ status: true, balance });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
});


router.post('/setgoal', verifyUser, async (req, res) => {
  const email = req.user.email;
  const { goalName, targetAmount } = req.body;

  try {
      const existingGoal = await GoalModel.findOne({ email });
      if (existingGoal) {
          return res.status(400).json({ status: false, message: "You have already set a goal." });
      }

      const incomes = await Income.find({ email });
      const expenses = await Expenses.find({ email });

      const totalIncome = incomes.reduce((acc, income) => acc + income.income, 0);
      const totalExpenses = expenses.reduce((acc, expense) => acc + expense.expenses, 0);
      const balance = totalIncome - totalExpenses;

      const newGoal = new GoalModel({
          email,
          goalName,
          targetAmount,
          currentBalance: balance,
      });
      await newGoal.save();

      if (balance < targetAmount) {
          var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: 'hamzamirzaop786@gmail.com',
                  pass: 'nhaj ddyh frgh iitj'
              }
          });

          var mailOptions = {
              from: 'hamzamirzaop786@gmail.com',
              to: email,
              subject: 'Low Balance Alert',
              text: `Your balance is currently ${balance}, which is below your goal of ${targetAmount}. Please review your finances.`
          };

          transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                  return res.json({ status: false, message: "Error sending email" });
              } else {
                  return res.json({ status: true, message: "Goal set and email sent", info: info.response });
              }
          });
      } else {
          return res.json({ status: true, message: "Goal set successfully", balance });
      }
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
});


router.get('/checkBalance', verifyUser, async (req, res) => {
  const email = req.user.email;

  try {
      const goal = await GoalModel.findOne({ email });
      if (!goal) {
          return res.status(404).json({ status: false, message: "No goal set." });
      }

      const incomes = await Income.find({ email });
      const expenses = await Expenses.find({ email });

      const totalIncome = incomes.reduce((acc, income) => acc + income.income, 0);
      const totalExpenses = expenses.reduce((acc, expense) => acc + expense.expenses, 0);
      const balance = totalIncome - totalExpenses;


      if (balance < goal.targetAmount) {
          var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: 'hamzamirzaop786@gmail.com',
                  pass: 'nhaj ddyh frgh iitj'
              }
          });

          var mailOptions = {
            user: 'hamzamirzaop786@gmail.com',
              to: email,
              subject: 'Low Balance Alert',
              text: `Your balance is currently ${balance}, which is below your goal of ${goal.targetAmount}. Please review your finances.`
          };

          await transporter.sendMail(mailOptions);
          return res.json({ status: true, message: "Balance checked and email sent" });
      } else {
          return res.json({ status: true, message: "Balance is sufficient", balance });
      }
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
});

router.get('/incomes', verifyUser, async (req, res) => {
  try {
      const email = req.user.email;  
      const incomes = await Income.find({ email });  
      return res.json(incomes);
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
});


router.get('/expenses', verifyUser, async (req, res) => {
  try {
      const email = req.user.email;  
      const expenses = await Expenses.find({ email });  
      return res.json(expenses);
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
});

export {router as UserRouter}