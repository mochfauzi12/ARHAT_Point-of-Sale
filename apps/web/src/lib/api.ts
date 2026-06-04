export const API_URL = 'http://localhost:8787/api';

function getToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
  return match ? match[2] : '';
}

function getHeaders(customHeaders: any = {}) {
  const token = getToken();
  return {
    ...customHeaders,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function loginPin(pin: string) {
  const res = await fetch(`${API_URL}/auth/login-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  if (!res.ok) throw new Error('Invalid PIN');
  const data = await res.json();
  if (typeof document !== 'undefined') {
    document.cookie = `token=${data.data.accessToken}; path=/; max-age=86400`;
  }
  return data;
}

export async function fetchProducts(query: string = '') {
  try {
    const res = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('Failed to fetch products:', err);
    return [];
  }
}

export async function checkoutTransaction(payload: any) {
  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to create transaction');
    const transaction = await res.json();
    
    // Process Checkout
    const checkoutRes = await fetch(`${API_URL}/transactions/${transaction.data.id}/checkout`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
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

export async function createProduct(payload: any) {
  const isFormData = payload instanceof FormData;
  const res = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
    body: isFormData ? payload : JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create product');
  return await res.json();
}

export async function updateProduct(id: string, payload: any) {
  const isFormData = payload instanceof FormData;
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
    body: isFormData ? payload : JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update product');
  return await res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return await res.json();
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: getHeaders(), // Don't set Content-Type for FormData, browser does it automatically with boundary
    body: formData
  });
  
  if (!res.ok) throw new Error('Failed to upload image');
  const json = await res.json();
  return json.data.url;
}

export async function getDashboardAnalytics() {
  const res = await fetch(`${API_URL}/analytics/dashboard`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error('Analytics API Error:', res.status, res.statusText, errorText);
    throw new Error(`Failed to fetch analytics: ${res.status}`);
  }
  return await res.json();
}

export async function getInventoryMovements() {
  const res = await fetch(`${API_URL}/inventory/movements`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch inventory movements');
  const json = await res.json();
  return json.data;
}

export async function restockProduct(productId: string, quantity: number, reason: string = 'Restock') {
  const res = await fetch(`${API_URL}/inventory/restock`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ productId, quantity, reason })
  });
  if (!res.ok) throw new Error('Failed to restock product');
  return await res.json();
}
