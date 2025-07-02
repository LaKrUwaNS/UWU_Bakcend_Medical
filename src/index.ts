// ==========================
// Imports
// ==========================
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors'; 
import dotenv from 'dotenv';

import mongoConnect from './config/mongoDB';
import DoctorRouter from './router/Doctor.route';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// ==========================
// MongoDB Connection Function
// ==========================
const connectDB = async (): Promise<void> => {
    try {
        await mongoConnect();
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

// ==========================
// Server Setup
// ==========================
const server = express();

// ==========================
// Middleware
// ==========================
server.use(morgan('dev'));
server.use(helmet());
server.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

// ==========================
// Routes
// ==========================
server.use('/doctor', DoctorRouter);

// ==========================
// Start server after DB connection
// ==========================
const startServer = async () => {
    await connectDB();
    server.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
};

startServer();
