// utils/sendTokenCookies.ts
import { Response } from 'express';
import { FifteenMinutesFromNow, SevenDaysFromNow } from '../utils/Date'

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


export const sendTokenAsCookie = (res: Response, token: string) => {

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only https in production
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    });

    res.status(200).json({
        success: true,
        token,
    });
};
