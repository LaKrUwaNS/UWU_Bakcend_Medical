// utils/sendTokenCookies.ts
import { Response } from 'express';
import { FifteenMinutesFromNow, SevenDaysFromNow } from '../utils/Date'


// !For sending both access and refresh tokens as cookies
// *This is used in the login and signup process to send both tokens as cookies
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


// !For the senting the one cookie for session cookie authorization
// *This is used in the login and signup process to send the access token as a cookie
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
