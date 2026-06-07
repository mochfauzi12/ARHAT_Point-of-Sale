import { Context } from 'hono';
import { WhatsAppService } from '../services/whatsapp.service';

export class WhatsAppController {
  static async processQueue(c: Context) {
    try {
      const result = await WhatsAppService.processPendingQueue();
      return c.json({ message: 'Queue processed successfully', data: result }, 200);
    } catch (error: any) {
      console.error('Process Queue Error:', error);
      return c.json({ message: 'Failed to process queue', error: error.message }, 500);
    }
  }

  static async notify(c: Context) {
    try {
      const body = await c.req.json();
      const user = c.get('user'); // Assuming auth middleware is used
      
      if (!body.phone || !body.message) {
        return c.json({ message: 'Phone and message are required' }, 400);
      }
      
      const result = await WhatsAppService.sendNotification(user?.tenantId || body.tenantId || '00000000-0000-0000-0000-000000000000', body.phone, body.message);
      return c.json({ message: 'Notification queued successfully', data: result }, 200);
    } catch (error: any) {
      console.error('Notify Error:', error);
      return c.json({ message: 'Failed to send notification', error: error.message }, 500);
    }
  }

  static async webhook(c: Context) {
    try {
      const body = await c.req.json();
      console.log('Received WhatsApp Webhook:', JSON.stringify(body, null, 2));
      
      // Typical Meta WhatsApp Webhook payload contains statuses
      // if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.statuses) {
      //   const statuses = body.entry[0].changes[0].value.statuses;
      //   for (const status of statuses) {
      //     await db.update(whatsappMessages)
      //       .set({ status: status.status }) // 'sent', 'delivered', 'read', 'failed'
      //       .where(eq(whatsappMessages.providerMessageId, status.id));
      //   }
      // }
      
      return c.json({ status: 'success' }, 200);
    } catch (error: any) {
      console.error('Webhook Error:', error);
      return c.json({ message: 'Internal Server Error' }, 500);
    }
  }

  static async verifyWebhook(c: Context) {
    // For Meta WhatsApp Webhook Verification
    const mode = c.req.query('hub.mode');
    const token = c.req.query('hub.verify_token');
    const challenge = c.req.query('hub.challenge');

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'arhat_pos_secret';

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return c.text(challenge || '', 200);
      }
      return c.text('Forbidden', 403);
    }
    return c.text('Bad Request', 400);
  }
}
