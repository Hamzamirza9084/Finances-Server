import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { UserRouter } from './routes/user.js'
import cookieParser from 'cookie-parser'

const app = express()

app.use(express.json())
app.use(cors({
    origin:["http://localhost:5173"],
    credentials: true
}))

const corsOptions = {
    origin: 'https://gregarious-fudge-8d4f5d.netlify.app', // Your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    credentials: true, // Allow cookies
  };
  
  app.use(cors(corsOptions));

app.use(cookieParser())
app.use('/auth',UserRouter)

mongoose.connect("mongodb://localhost:27017/finances_advisers")

app.get("/",(req,res)=>{
    res.json("Hello");
}
)

app.listen(process.env.PORT,()=>{
    console.log("server is running")
})