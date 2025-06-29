import nodemailer from "nodemailer";
import crypto from "crypto"

const gmailUser = "zlancanto.project@gmail.com"
const gmailPassword = "tmeybdoditxxefcy"

/* Generate OTP */
export const generateOTP = () => crypto.randomInt(100_000, 999_999).toString()

/* Email transporter setup */
export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailUser, //process.env.GMAIL_USER,
        pass: gmailPassword, //process.env.GMAIL_PASSWORD,
    }
})

export const sendOTP = async (email: string, otp: string) => {
    await transporter.sendMail({
        from: gmailPassword, //process.env.GMAIL_USER,
        to: email,
        subject: 'Zhéro OTP Verification',
        text: `Your OTP is ${otp}`,
        priority: 'high',
    })
}