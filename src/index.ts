import express from 'express';
import { PORT } from './const/dotenv';
import mongoConnect from './config/mongoDB';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const server = express();

// Data base connection
// Importing the MongoDB connection function
mongoConnect().then(() => {
    console.log('MongoDB connected successfully');

}).catch(error => {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
});

// Middleware setup
server.use(express.json());
server.use(helmet());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());


// Routers 















// Importing the routers
server.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});