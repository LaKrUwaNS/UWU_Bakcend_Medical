// ==========================
// Imports
// ==========================
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import { PORT } from './const/dotenv';
import mongoConnect from './config/mongoDB';

// ==========================
// Server Setup
// ==========================
const server = express();

// ==========================
// Database Connection
// ==========================
mongoConnect()
    .then(() => {
        console.log('✅ MongoDB connected successfully');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    });

// ==========================
// Middleware
// ==========================
server.use(morgan('dev')); // HTTP request logger
server.use(helmet()); // Security headers
server.use(express.json()); // Parse JSON bodies
server.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
server.use(cookieParser()); // Parse cookies

// ==========================
// Routes
// ==========================
// TODO: Add your routes here
// e.g., server.use('/api/users', userRouter);

// ==========================
// Start Server
// ==========================
server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
