import { Router  } from "express";
import { chatController } from "../controllers/chat.controller";
import { rateLimiterMiddleware } from "../middlewares/rateLimiter.middleware";
import { validateChatRequest } from "../middlewares/validation.middleware";

const router = Router();
router.get('/send',rateLimiterMiddleware,validateChatRequest,(req, res)=>{
    chatController.sendMessge(req,res);
})
router.get('/stream', rateLimiterMiddleware, (req,res)=>{
    chatController.streamMessage(req,res);
});
export default router;