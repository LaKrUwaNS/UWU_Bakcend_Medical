import dotenv from 'dotenv';


dotenv.config();


// Genaral
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;
export const NODE_ENV = process.env.NODE_ENV;

// Secrets
export const DOCTOR_CODE = process.env.DOCTOR_CODE;
export const STAFF_CODE = process.env.STAFF_CODE;

//Node mailer



//JWT
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE;


// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;


// Node mailer
export const EMAIL = process.env.NODE_MAILER_MAIL;
export const PASSWORD = process.env.NODE_MAILER_PASSWORD;


// Verify Code
export const VERIFY_CODE = process.env.VERIFY_CODE;

