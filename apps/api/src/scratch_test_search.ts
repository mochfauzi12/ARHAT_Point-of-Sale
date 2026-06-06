import { ProductService } from './services/product.service';
import { db } from './lib/db';

async function main() {
  try {
    const prods = await ProductService.searchProducts('00000000-0000-0000-0000-000000000000', '');
    console.log(`Found ${prods.length} products`);
    prods.forEach(p => console.log(p.name, p.sku));
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
