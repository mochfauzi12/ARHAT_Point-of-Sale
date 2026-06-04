export const API_URL = 'http://127.0.0.1:8787';

export async function fetchProducts(query: string = '') {
  try {
    const res = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export async function checkoutTransaction(payload: any) {
  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to create transaction');
    const transaction = await res.json();
    
    // Process Checkout
    const checkoutRes = await fetch(`${API_URL}/transactions/${transaction.id}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethod: payload.paymentMethod,
        amount: payload.totalAmount
      })
    });
    
    if (!checkoutRes.ok) throw new Error('Failed to process payment');
    return await checkoutRes.json();
  } catch (err) {
    console.error('Checkout error:', err);
    throw err;
  }
}
