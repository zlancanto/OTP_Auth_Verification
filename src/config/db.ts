import {connect} from "mongoose";
import {UserModel} from "../models/user.model";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("L'url de connexion à la bd est introuvable")
        }
        await connect(process.env.MONGO_URI)
        console.log('MongoDB connected successfully')

        /* Create the empty user collection */
        await UserModel.createCollection()
        console.log('User collection created successfully')
    }
    catch (error: any) {
        console.error('MongoDB connection failed : ', error.message)
        process.exit(1)
    }
}

export default connectDB