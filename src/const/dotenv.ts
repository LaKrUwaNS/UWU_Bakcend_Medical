import dotenv from 'dotenv';


dotenv.config();


// Genaral
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Secrets
export const DOCTOR_CODE = process.env.DOCTOR_CODE;
export const STAFF_CODE = process.env.STAFF_CODE;

//Node mailer





