// utils/sendTokenCookies.ts
import { Response } from 'express';
import { FifteenMinutesFromNow, SevenDaysFromNow } from '../utils/Date'
import { generateAccessToken } from './WebToken';

export const sendTokenCookies = (
    res: Response,
    accessToken: string,
    refreshToken: string,

) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: FifteenMinutesFromNow().getTime() - Date.now(),
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: SevenDaysFromNow().getTime() - Date.now(),
    });
};


export const sendTokenAsCookie = (res: Response, userId: string, message = "Login Success") => {
    const token = generateAccessToken(userId);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only https in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
        success: true,
        message,
        token,
    });
};
