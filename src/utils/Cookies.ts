import { Response } from 'express';
import { MinFromNow, DayFromNow } from './Date';

export const sendTokenCookie = (
    res: Response,
    accessToken: string,
    refreshToken: string
) => {
    res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: MinFromNow().getTime() - Date.now(), // duration in ms (~15 minutes)
    });

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: DayFromNow().getTime() - Date.now(), // duration in ms (~1 day)
    });
};
