import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
    err : Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.error(`Error caught by error handler`,{
        message: err.message,
        stack: err.stack,
        path: req.path,
    });
    res.status(500).json({
        error:'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message: 'Something went wrong',
    });
};