import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER_SMTP,
        pass: process.env.EMAIL_PASS_SMTP,
    },
});

async function sendEmail(to, subject, html){
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER_SMTP, // sender address
        to, // list of receivers
        subject, // Subject line
        html, // html body
    });
}

export default sendEmail;