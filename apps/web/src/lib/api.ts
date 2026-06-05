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
async function fetchWithAuth(url: string, options: any = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    if (typeof document !== 'undefined') {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }
  return res;
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
    const res = await fetchWithAuth(`${API_URL}/products/search?q=${encodeURIComponent(query)}`, {
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

export async function getTransactions() {
  const res = await fetchWithAuth(`${API_URL}/transactions`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  const json = await res.json();
  return json.data;
}

export async function checkoutTransaction(payload: any) {
  try {
    const res = await fetchWithAuth(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error('Failed to create transaction');
    const transaction = await res.json();
    
    // Process Checkout
    const checkoutRes = await fetchWithAuth(`${API_URL}/transactions/${transaction.data.id}/checkout`, {
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

export async function holdTransaction(payload: any) {
  const res = await fetchWithAuth(`${API_URL}/transactions/hold`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to hold transaction');
  const json = await res.json();
  return json.data;
}

export async function getHeldTransactions() {
  const res = await fetchWithAuth(`${API_URL}/transactions/held`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to get held transactions');
  const json = await res.json();
  return json.data;
}

export async function resumeTransaction(id: string) {
  const res = await fetchWithAuth(`${API_URL}/transactions/${id}/resume`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to resume transaction');
  const json = await res.json();
  return json.data;
}

export async function refundTransaction(id: string) {
  const res = await fetchWithAuth(`${API_URL}/transactions/${id}/refund`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to refund transaction');
  const json = await res.json();
  return json.data;
}

export async function voidTransaction(id: string) {
  const res = await fetchWithAuth(`${API_URL}/transactions/${id}/void`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to void transaction');
  const json = await res.json();
  return json.data;
}

export async function createProduct(payload: any) {
  const isFormData = payload instanceof FormData;
  const res = await fetchWithAuth(`${API_URL}/products`, {
    method: 'POST',
    headers: getHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
    body: isFormData ? payload : JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create product');
  const json = await res.json();
  return json.data;
}

export async function updateProduct(id: string, payload: any) {
  const isFormData = payload instanceof FormData;
  const res = await fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(isFormData ? {} : { 'Content-Type': 'application/json' }),
    body: isFormData ? payload : JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update product');
  const json = await res.json();
  return json.data;
}

export async function deleteProduct(id: string) {
  const res = await fetchWithAuth(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete product');
  const json = await res.json();
  return json.data;
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetchWithAuth(`${API_URL}/upload`, {
    method: 'POST',
    headers: getHeaders(), // Don't set Content-Type for FormData, browser does it automatically with boundary
    body: formData
  });
  
  if (!res.ok) throw new Error('Failed to upload image');
  const json = await res.json();
  return json.data.url;
}

export async function getDashboardAnalytics() {
  const res = await fetchWithAuth(`${API_URL}/analytics/dashboard`, {
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
  const res = await fetchWithAuth(`${API_URL}/inventory/movements`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch inventory movements');
  const json = await res.json();
  return json.data;
}

export async function fetchOutlets() {
  const res = await fetchWithAuth(`${API_URL}/inventory/outlets`, { headers: getHeaders() });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function createOutlet(name: string, address: string = '') {
  const res = await fetchWithAuth(`${API_URL}/inventory/outlets`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name, address })
  });
  if (!res.ok) throw new Error('Failed to create outlet');
  const json = await res.json();
  return json.data;
}

export async function fetchProductStockByOutlet(outletId: string) {
  const res = await fetchWithAuth(`${API_URL}/inventory/outlets/${outletId}/products`, { headers: getHeaders() });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function recordStockMovement(outletId: string, productId: string, type: 'in'|'out', quantity: number, reason: string = '') {
  const res = await fetchWithAuth(`${API_URL}/inventory/movements`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ outletId, productId, type, quantity, reason })
  });
  if (!res.ok) throw new Error('Failed to record stock movement');
  const json = await res.json();
  return json.data;
}

export async function fetchAdjustments(outletId: string) {
  const res = await fetchWithAuth(`${API_URL}/inventory/outlets/${outletId}/adjustments`, { headers: getHeaders() });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function createAdjustment(outletId: string, items: Array<{productId: string, adjustedStock: number, reason: string}>) {
  const res = await fetchWithAuth(`${API_URL}/inventory/outlets/${outletId}/adjustments`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error('Failed to create adjustment');
  const json = await res.json();
  return json.data;
}

export async function approveAdjustment(id: string) {
  const res = await fetchWithAuth(`${API_URL}/inventory/adjustments/${id}/approve`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to approve adjustment');
  const json = await res.json();
  return json.data;
}

export async function createOpname(outletId: string) {
  const res = await fetchWithAuth(`${API_URL}/inventory/outlets/${outletId}/opname`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to create opname');
  const json = await res.json();
  return json.data;
}

export async function completeOpname(id: string, items: Array<{productId: string, actualQuantity: number}>) {
  const res = await fetchWithAuth(`${API_URL}/inventory/opname/${id}/complete`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error('Failed to complete opname');
  const json = await res.json();
  return json.data;
}

export async function createTransfer(sourceOutletId: string, destinationOutletId: string, items: Array<{productId: string, quantity: number}>) {
  const res = await fetchWithAuth(`${API_URL}/inventory/transfers`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ sourceOutletId, destinationOutletId, items })
  });
  if (!res.ok) throw new Error('Failed to create transfer');
  const json = await res.json();
  return json.data;
}

export async function receiveTransfer(id: string) {
  const res = await fetchWithAuth(`${API_URL}/inventory/transfers/${id}/receive`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to receive transfer');
  const json = await res.json();
  return json.data;
}
