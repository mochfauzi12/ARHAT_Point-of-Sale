

async function main() {
  try {
    const login = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email: 'admin@arhatpos.com', password: 'password123' })
    });
    const loginData = await login.json();
    const token = loginData.data?.token;
    
    const res = await fetch('http://localhost:8000/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response length:', text.length);
  } catch (e) {
    console.error(e);
  }
}
main();
