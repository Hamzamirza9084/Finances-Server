import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { UserRouter } from './routes/user.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'https://gregarious-fudge-8d4f5d.netlify.app'], // Allow both local and deployed frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    credentials: true, // Allow cookies
};
app.use(cors(corsOptions));

// Routes
app.use('/auth', UserRouter);

app.get("/", (req, res) => {
    res.json("Hello");
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI || "your_default_connection_string", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
