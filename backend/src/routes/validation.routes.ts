import { Router } from "express";
import { ValidationController } from '../controllers/validation.controller';
import { ValidateKeyRequest } from "../middlewares/validation.middleware";

const router= Router();
router.post('/validate-key',ValidateKeyRequest, (req,res)=>{
    
    ValidationController.ValidateKeyRequest(req,res);
});

export default router;