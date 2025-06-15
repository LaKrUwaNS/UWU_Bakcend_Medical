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
