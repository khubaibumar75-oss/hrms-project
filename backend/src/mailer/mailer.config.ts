import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, fullName: string, verificationLink: string) {
  await transporter.sendMail({
    from: '"HRMS System" <no-reply@hrms.test>',
    to,
    subject: "Verify your HRMS account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to HRMS, ${fullName}!</h2>
        <p>Your account has been created. Click the link below to verify your email and set your password.</p>
        <p>
          <a href="${verificationLink}" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
            Verify Email & Set Password
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
        <p>If the button doesn't work, copy this link: ${verificationLink}</p>
      </div>
    `,
  });
}