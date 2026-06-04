import { Context } from 'hono';
import { ProductService } from '../services/product.service';

export const productController = {
  async search(c: Context) {
    const user = c.get('user');
    const query = c.req.query('q');
    
    if (!query) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }
    
    const products = await ProductService.searchProducts(user.tenantId, query);
    return c.json({ data: products });
  },

  async getById(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const product = await ProductService.getProductById(user.tenantId, id);
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json({ data: product });
  },

  async create(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    
    try {
      const product = await ProductService.createProduct({
        ...body,
        tenantId: user.tenantId
      });
      return c.json({ message: 'Product created', data: product }, 201);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
};
