import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../utils/dotenv";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: EMAIL,
        pass: PASSWORD,
    }, tls: {
        rejectUnauthorized: false  // Development testing
    }
});

export const SendMail = async (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: EMAIL,
        to,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("SendMail Error:", error);
        throw error;
    }
};
