import dotenv from 'dotenv';


dotenv.config();


// Genaral
export const PORT = process.env.PORT;
export const MONGO_URI = process.env.MONGO_URI;

// Secrets
export const DOCTOR_CODE = process.env.DOCTOR_CODE;
export const STAFF_CODE = process.env.STAFF_CODE;

//Node mailer



//JWT
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE;


// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;



