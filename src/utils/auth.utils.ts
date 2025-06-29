import {Types} from "mongoose";
import jwt from "jsonwebtoken";
import {MAX_AGE} from "../variables/auth.variable";

export const createToken = (userId: Types.ObjectId) => {
    if (!process.env.JWT_SECRET_KEY) {
        throw new Error('Missing JWT_SECRET_KEY')
    }

    return jwt.sign({id: userId}, process.env.JWT_SECRET_KEY, {
        expiresIn: MAX_AGE
    })
}