import { Response } from 'express';

export const handleError = (error: any, res: Response) => {
    console.error('Error occurred:', error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), // Optional stack trace
    });
};
