import {Model, Schema, Types, model} from "mongoose";
import {isEmail} from "validator";
import bcrypt from "bcrypt"

export interface IUser extends Document {
    _id: Types.ObjectId
    firstName: string
    name: string
    email: string
    password: string
    otp?: string
    otpExpiry?: Date
    isVerified: boolean
    createdAt: Date
    updatedAt: Date
}

interface IUserModel extends Model<IUser> {
    login(email: string, password: string): Promise<IUser>
}

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 25,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 25,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: [isEmail],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            trim: true,
        },
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        },
        /* Email verification status */
        isVerified: {
            type: Boolean,
            default: false,
        }
    },
    {timestamps: true}
)

/* Play func before save into display */
userSchema.pre("save", async function (next) {
    const salt: string = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

/* Login */
userSchema.statics.login = async function (email: string, password: string) {
    const user: IUser = await this.findOne({ email })
    if (!user) {
        throw new Error('Incorrect email')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Incorrect password')
    }

    if (!user.isVerified) {
        throw new Error('User not verified. Please verify OTP')
    }

    return user
}

export const UserModel: IUserModel = model<IUser, IUserModel>("User", userSchema)