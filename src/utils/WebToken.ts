import jwt from 'jsonwebtoken';
import {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRE,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRE
} from './dotenv';

interface Payload {
    id: string;
    role?: string;
}

if (
    !ACCESS_TOKEN_SECRET ||
    !ACCESS_TOKEN_EXPIRE ||
    !REFRESH_TOKEN_SECRET ||
    !REFRESH_TOKEN_EXPIRE
) {
    throw new Error('Missing environment variables');
}

const accessTokenSecret: jwt.Secret = ACCESS_TOKEN_SECRET as string;
const refreshTokenSecret: jwt.Secret = REFRESH_TOKEN_SECRET as string;

export const generateTokens = (payload: Payload) => {
    const accessToken = jwt.sign(payload, accessTokenSecret, {
        expiresIn: '15m'
    });

    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
        expiresIn: '7d'
    });

    return { accessToken, refreshToken };
};
