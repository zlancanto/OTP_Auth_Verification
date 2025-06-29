import {NextFunction, Request, Response} from "express"
import {IUser, UserModel} from "../models/user.model";
import {generateOTP, sendOTP} from "../utils/otp.utils";
import {createToken} from "../utils/auth.utils";
import {MAX_AGE} from "../variables/auth.variable";

/* Register User and send OTP */
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        /* On vérif que les identifiants du destinateur existent bien */
        if (!process.env.GMAIL_USER) {
            throw new Error('Adresse email du destinateur introuvable. La variable process.env.GMAIL_USER est introuvable')
        } else if (!process.env.GMAIL_PASSWORD) {
            throw new Error('Password du destinateur introuvable. La variable process.env.GMAIL_PASSWORD est introuvable')
        }

        const {firstName, name, email, password} = req.body
        const otp: string = generateOTP()
        /* Durée de vie de 10 min */
        const otpExpiry = new Date(Date.now() + 1000 * 60 * 10)
        const user: IUser = await UserModel.create({
            firstName,
            name,
            email,
            password,
            otp,
            otpExpiry,
        })

        await sendOTP(email, otp)

        res.status(201).json({
            message: 'User registered. Please confirm your account with OTP code sent to email',
            data: user
        })
    } catch (error) {
        /* On passe l'erreur au middleware */
        next(error)
    }
}

/* Verify OTP */
export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, otp} = req.body
        const user = await UserModel.findOne({email})
        if (!user) {
            res.status(400).json({message: 'User not found'})
            return
        }
        if (user.isVerified) {
            res.status(400).json({message: 'User already verified'})
            return
        }
        if (user.otp !== otp || (user.otpExpiry && user.otpExpiry < new Date())) {
            res.status(400).json({message: 'Invalid or expired OTP'})
            return
        }

        user.isVerified = true
        user.otp = undefined
        user.otpExpiry = undefined
        await user.save()

        res.status(200).json({
            message: 'Email verified successfully',
            data: user
        })
    }
    catch (error) {
        next(error)
    }
}

/* Resent OTP */
export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email} = req.body
        const user = await UserModel.findOne({email})
        if (!user) {
            res.status(400).json({message: 'User not found'})
            return
        }
        if (user.isVerified) {
            res.status(400).json({message: 'User already verified'})
            return
        }

        const otp: string = generateOTP()
        user.otp = otp
        user.otpExpiry = new Date(Date.now() + 1000 * 60 * 10)

        sendOTP(email, otp)

        res.status(200).json({message: 'OTP resent successfully'})
    }
    catch (error) {
        next(error)
    }
}

/* Login */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body
        const user: IUser = await UserModel.login(email, password)
        const token: string = createToken(user._id)

        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: MAX_AGE,
            secure: true,
            sameSite: 'strict'
        })
        res.status(200).json({
            message: 'User logged in successfully',
            data: user._id
        })
    }
    catch (error) {
        next(error)
    }
}

/* Logout */
export const logout = async (_: Request, res: Response) => {
    res.cookie('jwt', '', { httpOnly: true, maxAge: 0 })
    res.status(200).json({message: 'User logged out successfully'})
}

/* Dashboard (Protected Route) */
export const dashboard = async (_: Request, res: Response) => {
    res.status(200).json({message: `Welcom to the Dashboard, ${res.locals.user.firstName}`})
}