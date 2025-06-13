import multer from 'multer';

// Multer config: store file in memory (buffer) to send to Cloudinary directly
const storage = multer.memoryStorage();
export const upload = multer({ storage });
