import express, {Router} from "express";
import * as authController from "../controllers/auth.controller"
import {authorize} from "../middleware/auth.middleware";

const userRouter: Router = express.Router()

userRouter.post('/register', authController.register)
userRouter.post('/login', authController.login)
userRouter.post('/logout', authController.logout)
userRouter.post('/verifyOTP', authController.verifyOTP)
userRouter.post('/resendOTP', authController.resendOTP)
userRouter.get('/dashboard', authorize, authController.dashboard)

export default userRouter