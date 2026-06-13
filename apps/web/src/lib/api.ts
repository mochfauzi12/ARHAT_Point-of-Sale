export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api';
import { offlineDB } from './indexeddb';

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
  if (res.status === 403) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Akses ditolak: Akun demo tidak dapat mengubah data.');
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
    if (!res.ok) throw new Error('Failed to fetch from server');
    const json = await res.json();
    
    if (!query && json.data) {
      await offlineDB.saveCache('products_cache', json.data);
    }
    
    return json.data || [];
  } catch (err) {
    console.log('Fetching products failed, falling back to cache');
    const cachedProducts = await offlineDB.getCache('products_cache');
    if (query && cachedProducts.length > 0) {
       const lowerQ = query.toLowerCase();
       return cachedProducts.filter((p: any) => p.name.toLowerCase().includes(lowerQ) || (p.sku && p.sku.toLowerCase().includes(lowerQ)));
    }
    return cachedProducts;
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
  } catch (err: any) {
    // If network error or failed to fetch, fallback to offline sync queue
    if (!window.navigator.onLine || err.message === 'Failed to fetch' || err.message.includes('NetworkError') || err.message === 'Failed to create transaction') {
      console.log('Network error detected. Queuing transaction offline.');
      await offlineDB.enqueueSync(`${API_URL}/transactions/offline-sync`, 'POST', payload);
      
      // Return a simulated success response
      return {
        success: true,
        data: {
          id: 'offline-' + Date.now(),
          transactionNumber: 'OFF-' + Math.floor(Math.random() * 10000),
          ...payload,
          status: 'completed'
        },
        offline: true
      };
    }
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create product');
  }
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
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update product');
  }
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

// ==========================================
// RAW MATERIALS (BOM)
// ==========================================

export async function fetchRawMaterials() {
  const res = await fetchWithAuth(`${API_URL}/raw-materials`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch raw materials');
  const json = await res.json();
  return json.data || [];
}

export async function createRawMaterial(payload: any) {
  const res = await fetchWithAuth(`${API_URL}/raw-materials`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create raw material');
  const json = await res.json();
  return json.data;
}

export async function updateRawMaterial(id: string, payload: any) {
  const res = await fetchWithAuth(`${API_URL}/raw-materials/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update raw material');
  const json = await res.json();
  return json.data;
}

export async function deleteRawMaterial(id: string) {
  const res = await fetchWithAuth(`${API_URL}/raw-materials/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete raw material');
  const json = await res.json();
  return json.success;
}

export async function fetchProductBoms(productId: string) {
  const res = await fetchWithAuth(`${API_URL}/raw-materials/boms/${productId}`, { headers: getHeaders() });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function updateProductBoms(productId: string, boms: any[]) {
  const res = await fetchWithAuth(`${API_URL}/raw-materials/boms/${productId}`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(boms)
  });
  if (!res.ok) throw new Error('Failed to update product BOM');
  const json = await res.json();
  return json.success;
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

// ==========================================
// CUSTOMERS
// ==========================================

export async function getCustomers(search?: string) {
  try {
    const url = search ? `${API_URL}/customers?q=${encodeURIComponent(search)}` : `${API_URL}/customers`;
    const res = await fetchWithAuth(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch from server');
    const json = await res.json();
    
    if (!search && json.data) {
      await offlineDB.saveCache('customers_cache', json.data);
    }
    return json.data || [];
  } catch (err) {
    console.log('Fetching customers failed, falling back to cache');
    const cached = await offlineDB.getCache('customers_cache');
    if (search && cached.length > 0) {
      const lowerQ = search.toLowerCase();
      return cached.filter((c: any) => c.name.toLowerCase().includes(lowerQ) || (c.phone && c.phone.includes(search)));
    }
    return cached;
  }
}

export async function createCustomer(data: { name: string; phone?: string; email?: string; notes?: string }) {
  const res = await fetchWithAuth(`${API_URL}/customers`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create customer');
  const json = await res.json();
  return json.data;
}

export async function updateCustomer(id: string, data: { name: string; phone?: string; email?: string; notes?: string }) {
  const res = await fetchWithAuth(`${API_URL}/customers/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update customer');
  const json = await res.json();
  return json.data;
}

export async function getCustomerTransactions(id: string) {
  const res = await fetchWithAuth(`${API_URL}/customers/${id}/transactions`, {
    headers: getHeaders()
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function sendCustomerNotification(phone: string, message: string) {
  const res = await fetchWithAuth(`${API_URL}/whatsapp/notify`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ phone, message })
  });
  if (!res.ok) throw new Error('Failed to send notification');
  const json = await res.json();
  return json;
}

// =======================
// ANALYTICS & REPORTS
// =======================

export async function getSalesAnalytics() {
  const res = await fetchWithAuth(`${API_URL}/analytics/sales`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch sales analytics');
  const json = await res.json();
  return json.data;
}

export async function getProductAnalytics() {
  const res = await fetchWithAuth(`${API_URL}/analytics/products`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch product analytics');
  const json = await res.json();
  return json.data;
}

export async function getProfitLoss() {
  const res = await fetchWithAuth(`${API_URL}/analytics/profit-loss`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch profit and loss analytics');
  const json = await res.json();
  return json.data;
}

export async function getCustomerAnalytics() {
  const res = await fetchWithAuth(`${API_URL}/analytics/customers`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch customer analytics');
  const json = await res.json();
  return json.data;
}

// =======================
// SHIFT MANAGEMENT
// =======================

export async function getCurrentShift() {
  const res = await fetchWithAuth(`${API_URL}/shifts/current`, { headers: getHeaders() });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export async function openShift(startingCash: number, outletId?: string) {
  const res = await fetchWithAuth(`${API_URL}/shifts/open`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ startingCash, outletId })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to open shift');
  }
  const json = await res.json();
  return json.data;
}

export async function closeShift(actualEndingCash: number, notes?: string) {
  const res = await fetchWithAuth(`${API_URL}/shifts/close`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ actualEndingCash, notes })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to close shift');
  }
  const json = await res.json();
  return json.data;
}

export async function getShifts() {
  const res = await fetchWithAuth(`${API_URL}/shifts`, { headers: getHeaders() });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

// =======================
// USER MANAGEMENT
// =======================

export async function getUsers() {
  const res = await fetchWithAuth(`${API_URL}/users`, { headers: getHeaders() });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function createUser(data: { fullName: string; email: string; password?: string; role: string; pin?: string }) {
  const res = await fetchWithAuth(`${API_URL}/users`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create user');
  }
  const json = await res.json();
  return json.data;
}

export async function updateUser(id: string, data: { fullName?: string; role?: string; password?: string; pin?: string }) {
  const res = await fetchWithAuth(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update user');
  }
  const json = await res.json();
  return json.data;
}

export async function deleteUser(id: string) {
  const res = await fetchWithAuth(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete user');
  }
  return true;
}

// Discounts
export async function getDiscounts() {
  const res = await fetchWithAuth(`${API_URL}/discounts`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch discounts');
  return res.json();
}

export async function createDiscount(data: any) {
  const res = await fetchWithAuth(`${API_URL}/discounts`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create discount');
  }
  return res.json();
}

export async function updateDiscount(id: string, data: any) {
  const res = await fetchWithAuth(`${API_URL}/discounts/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update discount');
  }
  return res.json();
}

export async function deleteDiscount(id: string) {
  const res = await fetchWithAuth(`${API_URL}/discounts/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete discount');
  return res.json();
}

export async function validateDiscount(code: string, subtotal: number) {
  const res = await fetchWithAuth(`${API_URL}/discounts/validate?code=${code}&subtotal=${subtotal}`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid promo code');
  }
  return res.json();
}

// =======================
// SUPERADMIN
// =======================

export async function fetchSuperadminTenants() {
  const res = await fetchWithAuth(`${API_URL}/superadmin/tenants`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch tenants');
  }
  const json = await res.json();
  return json.data || [];
}

export async function deactivateTenant(id: string) {
  const res = await fetchWithAuth(`${API_URL}/superadmin/tenants/${id}/deactivate`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to deactivate tenant');
  }
  return res.json();
}

export async function activateTenant(id: string) {
  const res = await fetchWithAuth(`${API_URL}/superadmin/tenants/${id}/activate`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to activate tenant');
  }
  return res.json();
}

export async function deleteTenant(id: string) {
  const res = await fetchWithAuth(`${API_URL}/superadmin/tenants/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete tenant');
  }
  return res.json();
}

export async function bulkDeactivateTenants(tenantIds: string[]) {
  const res = await fetchWithAuth(`${API_URL}/superadmin/tenants/bulk-deactivate`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tenantIds })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to deactivate tenants');
  }
  return res.json();
}

export async function bulkActivateTenants(tenantIds: string[]) {
  const res = await fetchWithAuth(`${API_URL}/superadmin/tenants/bulk-activate`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tenantIds })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to activate tenants');
  }
  return res.json();
}

export async function bulkDeleteTenants(tenantIds: string[]) {
  const res = await fetchWithAuth(`${API_URL}/superadmin/tenants/bulk-delete`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ tenantIds })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete tenants');
  }
  return res.json();
}
