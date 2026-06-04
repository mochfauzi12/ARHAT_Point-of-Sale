import { TransactionService } from './src/services/transaction.service';
import 'dotenv/config';

async function run() {
  try {
    const payload = {
      items: [
        {
          productId: '11111111-2222-3333-4444-000000000001',
          quantity: 1,
          unitPrice: 18000,
          subtotal: 18000
        }
      ],
      subtotal: 18000,
      taxAmount: 1980,
      discountAmount: 0,
      totalAmount: 19980
    };

    console.log('Creating transaction...');
    const tx = await TransactionService.createTransaction(
      '00000000-0000-0000-0000-000000000000',
      '11111111-1111-1111-1111-111111111111',
      payload
    );
    console.log('Transaction created:', tx.id);
    
    console.log('Processing checkout...');
    const result = await TransactionService.checkout(
      '00000000-0000-0000-0000-000000000000',
      tx.id,
      'Cash',
      19980
    );
    console.log('Checkout successful!');
  } catch (err) {
    console.error('Error during checkout:', err);
  }
  process.exit(0);
}

run();
