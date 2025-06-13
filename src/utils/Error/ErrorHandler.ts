import { Response } from 'express';

type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

export const handleError = (error: any, res: Response) => {
    console.error('Error occurred:', error);

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        message: error.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }), 
    });
};


export const TryCatch = <T = any>(fn: AsyncFunction<T>) => {
    return async (...args: Parameters<typeof fn>): Promise<void> => {
        try {
            await fn(...args);
        } catch (error: any) {
            console.error("An async error occurred:", {
                message: error?.message || "Unknown error",
                stack: error?.stack,
                error,
            });
        }
    };
};