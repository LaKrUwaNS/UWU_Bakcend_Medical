export const generateOtpEmailHtml = (otpCode: string): string => {
    return `
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP Verification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            background-attachment: fixed;
            min-height: 100vh;
            padding: 20px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 24px;
            overflow: hidden;
            box-shadow:
                0 32px 64px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
        }

        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }

            to {
                transform: rotate(360deg);
            }
        }

        .logo {
            max-width: 120px;
            margin-bottom: 20px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            z-index: 2;
        }

        .logo:hover {
            transform: scale(1.1) rotate(2deg);
        }

        .header-title {
            color: white;
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
            z-index: 2;
        }

        .header-subtitle {
            color: rgba(255, 255, 255, 0.9);
            font-size: 1.1rem;
            font-weight: 400;
            position: relative;
            z-index: 2;
        }

        .content {
            padding: 50px 40px;
            text-align: center;
            background: white;
        }

        .verification-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 30px;
            box-shadow: 0 12px 24px rgba(16, 185, 129, 0.3);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.05);
            }
        }

        .verification-icon::before {
            content: '🔐';
            font-size: 2rem;
        }

        .main-message {
            font-size: 1.3rem;
            color: #1f2937;
            margin-bottom: 30px;
            font-weight: 500;
            line-height: 1.5;
        }

        .otp-container {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 20px;
            padding: 40px 20px;
            margin: 40px 0;
            position: relative;
            overflow: hidden;
            border: 2px solid #e5e7eb;
        }

        .otp-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #f59e0b);
            background-size: 400% 100%;
            animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {

            0%,
            100% {
                background-position: 0% 50%;
            }

            50% {
                background-position: 100% 50%;
            }
        }

        .otp-label {
            font-size: 0.9rem;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }

        .otp-code {
            font-size: 3.5rem;
            font-weight: 800;
            color: #1f2937;
            letter-spacing: 8px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            user-select: all;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .otp-code:hover {
            transform: scale(1.05);
            color: #4f46e5;
        }

        .copy-hint {
            font-size: 0.85rem;
            color: #9ca3af;
            margin-top: 12px;
            font-style: italic;
        }

        .warning-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 2px solid #f59e0b;
            border-radius: 16px;
            padding: 20px;
            margin: 30px 0;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .warning-icon {
            font-size: 1.5rem;
            animation: bounce 2s infinite;
        }

        @keyframes bounce {

            0%,
            20%,
            50%,
            80%,
            100% {
                transform: translateY(0);
            }

            40% {
                transform: translateY(-8px);
            }

            60% {
                transform: translateY(-4px);
            }
        }

        .warning-text {
            color: #92400e;
            font-weight: 600;
            font-size: 1rem;
        }

        .security-tips {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-radius: 16px;
            padding: 25px;
            margin: 30px 0;
            text-align: left;
        }

        .security-tips h3 {
            color: #1e40af;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .security-tips ul {
            list-style: none;
            color: #1e3a8a;
        }

        .security-tips li {
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }

        .security-tips li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }

        .footer {
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            padding: 40px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            color: #6b7280;
            font-size: 0.9rem;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .company-info {
            color: #9ca3af;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .social-links {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 15px;
        }

        .social-link {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: white;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        /* Responsive Design */
        @media screen and (max-width: 640px) {
            body {
                padding: 10px;
            }

            .email-wrapper {
                border-radius: 16px;
            }

            .header {
                padding: 30px 20px;
            }

            .header-title {
                font-size: 1.8rem;
            }

            .content {
                padding: 30px 20px;
            }

            .otp-code {
                font-size: 2.5rem;
                letter-spacing: 4px;
            }

            .warning-box {
                flex-direction: column;
                text-align: center;
                gap: 10px;
            }

            .security-tips {
                padding: 20px;
            }

            .social-links {
                flex-wrap: wrap;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-wrapper {
                background: rgba(17, 24, 39, 0.95);
                border-color: rgba(55, 65, 81, 0.3);
            }

            .content {
                background: #111827;
            }

            .main-message {
                color: #f9fafb;
            }

            .otp-container {
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                border-color: #374151;
            }

            .otp-code {
                color: #f9fafb;
            }

            .copy-hint {
                color: #6b7280;
            }
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="header">
            <img src="https://www.uwu.ac.lk/wp-content/uploads/logo_uwu.jpg" alt="UWU Logo" class="logo" />
            <h1 class="header-title">UWU Medical Portal</h1>
            <p class="header-subtitle">Secure verification for your medical account</p>
        </div>

        <div class="content">
            <div class="verification-icon"></div>

            <p class="main-message">
                We've generated a secure OTP code for your UWU Medical account verification.
                Use this code to complete your authentication process and access the medical portal.
            </p>

            <div class="otp-container">
                <div class="otp-label">Your OTP Code</div>
                <div class="otp-code">${otpCode}</div>
                <div class="copy-hint">Click to select • Copy and paste this code</div>
            </div>

            <div class="warning-box">
                <span class="warning-icon">⏰</span>
                <span class="warning-text">This OTP expires in 15 minutes for your security</span>
            </div>

            <div class="security-tips">
                <h3>🛡️ Security Tips</h3>
                <ul>
                    <li>Never share this OTP with anyone</li>
                    <li>UWU will never ask for your OTP via phone or email</li>
                    <li>Use this code only on the official UWU platform</li>
                    <li>If you didn't request this, contact support immediately</li>
                </ul>
            </div>
        </div>

        <div class="footer">
            <p class="footer-text">
                If you didn't request this verification code, you can safely ignore this email.
                Your UWU Medical account remains secure and no action is required.<br>
                <strong>Need help?</strong> Contact our support team at uwumedical@gmail.com
            </p>

            <div class="company-info">
                <strong>Uva Wellassa University</strong><br>
                Centre of Excellence for Value Addition<br>
                Passara Road, Badulla 90000, Sri Lanka<br>
                Tel: +94 55 2226400 | Email: uwumedical@gmail.com<br>
                © 2025 UWU Medical System. All rights reserved.
            </div>

            <div class="social-links">
                <a href="mailto:uwumedical@gmail.com" class="social-link" title="Email Support">📧</a>
                <a href="https://www.uwu.ac.lk" class="social-link" title="Visit Website">🌐</a>
                <a href="http://localhost" class="social-link" title="Medical Portal">🏥</a>
            </div>
        </div>
    </div>
</body>

</html>    `;
};
