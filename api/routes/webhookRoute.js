import { Router } from "express";
import { handlePaymentNotification } from "../controllers/webhookController.js"; 

const router = Router();

router.post('/payvessel_payment_done', handlePaymentNotification);

export default router;
