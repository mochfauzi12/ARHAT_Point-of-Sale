import { Hono } from 'hono';
import { WhatsAppController } from '../controllers/whatsapp.controller';

const router = new Hono();

// Trigger queue processing manually or via cron
router.post('/process-queue', WhatsAppController.processQueue);

// Webhook endpoints for WhatsApp Business API
router.get('/webhook', WhatsAppController.verifyWebhook);
router.post('/webhook', WhatsAppController.webhook);

// Generic notification endpoint
router.post('/notify', WhatsAppController.notify);

export default router;
