export class WhatsAppService {
    /**
     * Mock function to send a WhatsApp receipt to a customer
     */
    static async sendReceipt(phone, transaction) {
        if (!phone)
            return;
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real implementation, this would call a WhatsApp API provider
        console.log(`\n==========================================`);
        console.log(`🟢 [WhatsApp Mock API] Mengirim Struk Transaksi...`);
        console.log(`Ke Nomor: ${phone}`);
        console.log(`Pesan:`);
        console.log(`Halo! Terima kasih telah berbelanja di *Transaksi Kita*.`);
        console.log(`Berikut adalah ringkasan transaksi Anda:`);
        console.log(`No. Transaksi: ${transaction.transactionNumber || transaction.id}`);
        console.log(`Total Belanja: Rp ${parseInt(transaction.totalAmount || '0').toLocaleString('id-ID')}`);
        console.log(`Metode Pembayaran: ${transaction.paymentMethod || 'Tunai'}`);
        console.log(``);
        console.log(`Semoga harimu menyenangkan!`);
        console.log(`==========================================\n`);
        return true;
    }
    /**
     * Mock function to send low stock alerts to the store owner
     */
    static async sendLowStockAlert(phone, productName, remainingStock) {
        if (!phone)
            return;
        console.log(`\n==========================================`);
        console.log(`⚠️ [WhatsApp Mock API] Mengirim Peringatan Stok...`);
        console.log(`Ke Nomor: ${phone}`);
        console.log(`Pesan:`);
        console.log(`⚠️ *Peringatan Stok Tipis* ⚠️`);
        console.log(`Stok produk *${productName}* saat ini hanya tersisa ${remainingStock}.`);
        console.log(`Segera lakukan restock!`);
        console.log(`==========================================\n`);
        return true;
    }
}
