import {ErrorRequestHandler, NextFunction, Request, Response} from 'express'
import { Error as MongooseError } from 'mongoose'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

export const errorHandle: ErrorRequestHandler = (
    err: unknown,
    _: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('🔴 Global Error Handler:', err)

    if (res.headersSent) {
        return next(err)
    }

    // Déclarations par défaut
    let status: number = 500
    let message: string = 'Une erreur interne est survenue.'
    let errorDetails: any = {}

    // Erreurs MongoDB
    if (err instanceof MongooseError.ValidationError) {
        status = 400
        message = 'Erreur de validation.'
        errorDetails = err.errors
    }
    else if (err instanceof MongooseError.CastError) {
        status = 400
        message = 'Identifiant ou type de champ invalide.'
    }
    else if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as any).code === 11000
    ) {
        // Erreur de clé dupliquée
        status = 409
        const duplicatedField = Object.keys((err as any).keyValue)[0]
        message = `Valeur déjà utilisée pour le champ "${duplicatedField}".`
    }

    //  Erreurs JWT
    else if (err instanceof TokenExpiredError) {
        status = 401
        message = 'Token expiré. Veuillez vous reconnecter.'
    }
    else if (err instanceof JsonWebTokenError) {
        status = 401
        message = 'Token invalide.'
    }

    // Erreur JS standard
    else if (err instanceof Error) {
        message = err.message
        errorDetails = err
    }

    // Erreur inconnue
    else {
        message = 'Une erreur inconnue est survenue.'
        errorDetails = err
    }

    res.status(status).json({
        status: 'error',
        message,
        error: errorDetails,
    })
}
