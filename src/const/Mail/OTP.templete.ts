export const generateOtpEmailHtml = (otpCode: string): string => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>OTP Verification</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f6fff6;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #e0f7e9;
            max-width: 600px;
            margin: 40px auto;
            border: 1px solid #b0eac8;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        h1 {
            color: #2e7d32;
            text-align: center;
        }
        .otp-box {
            background-color: #d4f5dd;
            border: 2px dashed #81c784;
            font-size: 28px;
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            color: #1b5e20;
            letter-spacing: 5px;
            font-weight: bold;
        }
        .message {
            text-align: center;
            font-size: 16px;
            color: #2e7d32;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #4caf50;
            margin-top: 30px;
        }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Your OTP Code</h1>
            <p class="message">Use the OTP code below to verify your account:</p>
  
            <div class="otp-box">
                ${otpCode}
        </div>
  
        <p class="message">⚠️ This OTP is valid only for <strong>15 minutes</strong>.</p>
  
        <div class="footer">
            If you did not request this, you can safely ignore this email.<br/>
            &copy; 2025 UWU
        </div>
        </div>
    </body>
    </html>
    `;
};
