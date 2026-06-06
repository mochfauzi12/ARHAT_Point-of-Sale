import fetch from 'node-fetch';

async function main() {
  try {
    // 1. Get token
    const login = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: 'admin@arhatpos.com', password: 'password123' })
    });
    const loginData = await login.json();
    const token = loginData.data?.token;
    if (!token) {
        console.log("No token:", loginData);
        return;
    }
    
    // 2. Create product
    const res = await fetch('http://localhost:8000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'test_drizzle',
        sku: '123123',
        price: 10000,
        cost: 5000,
        stock: 7,
        imageUrl: '',
        isActive: true,
        isService: false
      })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (e) {
    console.error(e);
  }
}

main();
