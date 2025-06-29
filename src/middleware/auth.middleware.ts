import {NextFunction, Request, Response} from 'express'
import jwt, {JwtPayload} from "jsonwebtoken";
import {UserModel} from "../models/user.model";

/**
 * Exécuté à chaque requête utilisateur
 * Permet de vérifier si l'utilisateur est auth avec le bon token
 * @param req
 * @param res
 * @param next
 */
export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt
    if (!token) {
        res.locals.user = null
        next()
    }

    if (!process.env.JWT_SECRET_KEY) {
        throw new Error('Secret key JWT_SECRET_KEY is not defined in environment variables')
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload
        const user = await UserModel.findById(decoded.id)
        res.locals.user = user || null
    }
    catch (error) {
        res.locals.user =null
        res.cookie("jwt", '', {maxAge: 0})
    }

    return next()
}

/**
 * Vérifie le token lors de l'auth du user
 * @param req
 * @param res
 * @param next
 */
export const requireAuth = async (req: Request, _: Response, next: NextFunction) => {
    const token = req.cookies.jwt
    if (!token) {
        console.warn('No token')
    }

    if (!process.env.JWT_SECRET_KEY) {
        throw new Error('Secret key JWT_SECRET_KEY is not defined in environment variables')
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload
        console.log('decodedToken.id : ', decodedToken.id)
        next()
    }
    catch (error) {
        console.error('error : ', error)
    }
}

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.jwt) {
        res.status(401).json({message: 'Unauthorized. Please log in first.'})
        return
    }
    next()
}