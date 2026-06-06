import { db } from './lib/db';
import { products } from './models/index';
import { eq } from 'drizzle-orm';

async function update() {
  const images = {
    'KOP-001': 'https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?auto=format&fit=crop&q=80&w=400', // Kopi aren
    'KOP-002': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=400', // Americano dingin
    'TEH-001': 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&q=80&w=400', // Teh tarik
    'TEH-002': 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=400', // Matcha
    'MKN-001': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=400', // Roti bakar
    'MKN-002': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400'  // Croissant
  };

  for (const [sku, url] of Object.entries(images)) {
    await db.update(products).set({ imageUrl: url }).where(eq(products.sku, sku));
  }
  console.log('Images updated!');
  process.exit(0);
}
update();
