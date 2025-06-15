export const generateResetOtpEmailHtml = (otp: string): string => {
    return `
    <html>
        <body style="font-family: Arial; background: #f6fff6; padding: 20px;">
            <div style="max-width: 600px; background: #e0f7e9; padding: 20px; border-radius: 10px;">
                <h2 style="color: #2e7d32; text-align: center;">Reset Your Password</h2>
                <p style="color: #2e7d32; text-align: center;">Use the OTP below to reset your password:</p>
                <div style="background: #d4f5dd; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #1b5e20; border: 2px dashed #81c784; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="text-align: center; color: #2e7d32;">⚠️ This OTP is valid for only <strong>15 minutes</strong>.</p>
                <p style="font-size: 12px; color: #4caf50; text-align: center;">If you didn't request this, please ignore this email.</p>
            </div>
        </body>
    </html>
    `;
};
