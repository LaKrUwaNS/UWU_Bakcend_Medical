import mongoose, { Mongoose } from 'mongoose';
import { MONGO_URI } from '../utils/dotenv';

const mongoConnect = async (): Promise<Mongoose> => {
    try {
        const connection = await mongoose.connect(MONGO_URI as string);
        console.log(`MongoDB connected: ${connection.connection.host}`);
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

export default mongoConnect;
