export const generateWelcomeEmailHtml = (name: string): string => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to UWU Medical</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #ecfdf5;
            padding: 20px;
            margin: 0;
        }

        .email-wrapper {
            max-width: 650px;
            margin: auto;
            background: #fff;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: 1px solid #d1fae5;
        }

        .banner {
            background: linear-gradient(135deg, #02ff52, #006b49);
            color: white;
            padding: 40px 20px;
            text-align: center;
        }

        .banner img {
            max-width: 100px;
            margin-bottom: 15px;
            border-radius: 12px;
        }

        .banner h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }

        .banner p {
            font-size: 16px;
            font-weight: 400;
            color: #e6fff8;
        }

        .content {
            padding: 30px 20px;
            text-align: center;
        }

        .content h2 {
            font-size: 22px;
            color: #065f46;
            margin-bottom: 10px;
        }

        .content p {
            font-size: 16px;
            color: #334155;
        }

        .footer {
            padding: 20px;
            background-color: #f0fdf4;
            font-size: 13px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <div class="banner">
            <img src="https://www.uwu.ac.lk/wp-content/uploads/logo_uwu.jpg" alt="UWU Logo" />
            <h1>Welcome to UWU Medical System</h1>
            <p>Your health, our priority</p>
        </div>

        <div class="content">
            <h2>Hi ${name},</h2>
            <p>
                Welcome aboard! Your account has been successfully registered. <br />
                Please remember to keep your credentials safe and secure.<br />
                We’re excited to support your wellness journey.
            </p>
        </div>

        <div class="footer">
            © 2025 Uva Wellassa University Medical Center, Badulla, Sri Lanka<br />
            Contact: uwumedical@gmail.com | +94 55 2226400
        </div>
    </div>
</body>

</html>
    `;
};
