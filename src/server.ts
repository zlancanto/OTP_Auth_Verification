import {config} from "dotenv";
import express, {Express} from "express";
import connectDB from "./config/db";
import {errorHandle} from "./middleware/error.middleware";
import cookieParser from "cookie-parser"
import {checkUser, requireAuth} from "./middleware/auth.middleware";
import {Request, Response} from "express";
import userRouter from "./routes/auth.routes";

/* Port */
const port = process.env.PORT || 9000

/* Chargement de dotenv */
config()

/* DB Connection */
connectDB()

const app: Express = express()

/* Middlewares */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// JWT
app.use(checkUser)
app.get('/jwtId', requireAuth, (req: Request, res: Response) => {
    res.status(200).json({message: `res.locals.user.id = ${res.locals.user.id}`})
})

/* Routes */
app.use('/api/auth', userRouter)

/* Middleware d'erreur */
app.use(errorHandle)

/* Port écouté par le serveur */
app.listen(port, () => console.log(`App listening on port ${port}`))