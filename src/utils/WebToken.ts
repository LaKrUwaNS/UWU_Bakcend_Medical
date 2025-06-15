// utils/generateTokens.ts
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from './dotenv';

export const generateAccessToken = (userId: string): string => {
    return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET as string, {
        expiresIn: '15m',
    });
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET as string, {
        expiresIn: '7d',
    });
};
