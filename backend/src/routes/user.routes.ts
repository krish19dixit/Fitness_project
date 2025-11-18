import { Router } from "express";
import { usageController } from "../controllers/usage.controller";

const router= Router();
router.get('/stats',(req,res)=> usageController.getUsageStats(req,res));
export default router;