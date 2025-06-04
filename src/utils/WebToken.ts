import jwt from 'jsonwebtoken';

// Create web token
export const createToken = (user: any) => {
    return jwt.sign(user, process.env.JWT_SECRET_KEY as string);
}

// Verify the Web Token
export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY as string);
}
