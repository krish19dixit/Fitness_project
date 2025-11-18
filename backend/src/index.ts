import express from "express";
import helmet from "helmet";
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from "./utils/logger";
import chatRoutes from './routes/chat.routes';
import usageRoutes from './routes/user.routes';
import validationRoutes from './routes/validation.routes';
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { redisService } from "./services/redis-service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({extended:true}));
app.use(compression);
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(helmet());

app.get('/health',(req, res)=>{
    res.json({
        status: 'ok',
        version:'1.0.0',
        timestamp: new Date().toISOString(),
    });
});

app.use('/api/chat',chatRoutes);
app.use('/api/usage',usageRoutes);
app.use('/api/validates',validationRoutes);

app.use('*',(req,res)=>{
    res.status(404).json({
        error: 'Not Found',
        message: 'The resquest endpoint does not exist',
    });
});
app.use(errorHandler);
const startServer = async ()=> {
    try{
        await redisService.connect();
        app.listen(PORT, ()=>{
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info( `CORS enabled for : ${process.env.CORS_ORIGIN}`);
        });
    } catch(error){
        logger.error('Failed to start the server',error);
        process.exit(1);
    }
};
process.on('SIGTERM',async ()=>{
    logger.info('SIGTERM receive, shutting down gracefully');
    await redisService.disconnect();
    process.exit(0);
});
process.on('SIGINT',async () => {
    logger.info('SIGINT receive, shutting down gracefully');
    await redisService.disconnect();
    process.exit(0);
});
startServer();