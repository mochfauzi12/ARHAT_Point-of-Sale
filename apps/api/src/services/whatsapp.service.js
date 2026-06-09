import { db } from '../lib/db';
import { whatsappMessages } from '../models';
import { eq, inArray } from 'drizzle-orm';
export class WhatsAppService {
    /**
     * Mock function to send a WhatsApp receipt to a customer
     */
    static async sendReceipt(tenantId, phone, transaction) {
        if (!phone)
            return;
        const messageContent = `Halo! Terima kasih telah berbelanja di *Transaksi Kita*.
Berikut adalah ringkasan transaksi Anda:
No. Transaksi: ${transaction.transactionNumber || transaction.id}
Total Belanja: Rp ${parseInt(transaction.totalAmount || '0').toLocaleString('id-ID')}
Metode Pembayaran: ${transaction.paymentMethod || 'Tunai'}

Semoga harimu menyenangkan!`;
        // 1. Insert to DB as pending
        const [insertedMsg] = await db.insert(whatsappMessages).values({
            tenantId,
            transactionId: transaction.id,
            customerId: transaction.customerId || null,
            recipientPhone: phone,
            messageType: 'receipt',
            content: messageContent,
            status: 'pending'
        }).returning();
        // 2. Try to send immediately (or push to queue)
        // Here we simulate an immediate send
        this.processMessage(insertedMsg.id).catch(console.error);
        return insertedMsg;
    }
    /**
     * Mock function to send low stock alerts to the store owner
     */
    static async sendLowStockAlert(tenantId, phone, productName, remainingStock) {
        if (!phone)
            return;
        const messageContent = `⚠️ *Peringatan Stok Tipis* ⚠️\nStok produk *${productName}* saat ini hanya tersisa ${remainingStock}.\nSegera lakukan restock!`;
        const [insertedMsg] = await db.insert(whatsappMessages).values({
            tenantId,
            recipientPhone: phone,
            messageType: 'notification',
            content: messageContent,
            status: 'pending'
        }).returning();
        this.processMessage(insertedMsg.id).catch(console.error);
        return insertedMsg;
    }
    /**
     * Mock function to send generic notification to customer
     */
    static async sendNotification(tenantId, phone, message) {
        if (!phone)
            return;
        const [insertedMsg] = await db.insert(whatsappMessages).values({
            tenantId,
            recipientPhone: phone,
            messageType: 'notification',
            content: message,
            status: 'pending'
        }).returning();
        this.processMessage(insertedMsg.id).catch(console.error);
        return insertedMsg;
    }
    /**
     * Process a single message (Mock API Call)
     */
    static async processMessage(messageId) {
        const [message] = await db.select().from(whatsappMessages).where(eq(whatsappMessages.id, messageId));
        if (!message)
            return;
        console.log(`\n==========================================`);
        console.log(`🟢 [WhatsApp Mock API] Mengirim Pesan...`);
        console.log(`ID Pesan: ${message.id}`);
        console.log(`Ke Nomor: ${message.recipientPhone}`);
        console.log(`Pesan:\n${message.content}`);
        console.log(`==========================================\n`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Update status to sent
        await db.update(whatsappMessages)
            .set({
            status: 'sent',
            sentAt: new Date(),
            providerMessageId: `mock-wa-id-${Date.now()}`
        })
            .where(eq(whatsappMessages.id, messageId));
        return true;
    }
    /**
     * Process all pending messages in queue
     */
    static async processPendingQueue() {
        const pendingMessages = await db.select()
            .from(whatsappMessages)
            .where(inArray(whatsappMessages.status, ['pending', 'failed']))
            .limit(50);
        console.log(`[WhatsApp Queue] Processing ${pendingMessages.length} messages...`);
        for (const msg of pendingMessages) {
            await this.processMessage(msg.id).catch(err => {
                console.error(`Failed to process message ${msg.id}`, err);
            });
        }
        return { processed: pendingMessages.length };
    }
}
