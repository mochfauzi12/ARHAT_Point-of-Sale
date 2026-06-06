import { ProductService } from './services/product.service';

async function main() {
  try {
    const tenantId = '00000000-0000-0000-0000-000000000000';
    const prods = await ProductService.searchProducts(tenantId, '');
    console.log('Total products:', prods.length);
    prods.forEach(p => console.log(`- ${p.name} (sku: ${p.sku})`));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
main();
