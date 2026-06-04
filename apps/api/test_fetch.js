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

    console.log('Fetching /api/transactions');
    const res = await fetch('http://localhost:8787/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
    
    if (res.ok) {
        const data = JSON.parse(text);
        const checkoutRes = await fetch(`http://localhost:8787/api/transactions/${data.data.id}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentMethod: 'Cash', amount: 19980 })
        });
        const checkoutText = await checkoutRes.text();
        console.log('Checkout Status:', checkoutRes.status);
        console.log('Checkout Response:', checkoutText);
    }
  } catch (err) {
    console.error(err);
  }
}
run();
