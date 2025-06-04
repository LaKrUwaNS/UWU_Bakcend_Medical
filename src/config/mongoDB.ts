import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Make sure env variables are loaded

const mongoConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(` MongoDB connected: ${connect.connection.host}`);
        return connect;
    } catch (err) {
        console.error(' MongoDB connection error:', err);
        process.exit(1);
    }
};

export default mongoConnect;
