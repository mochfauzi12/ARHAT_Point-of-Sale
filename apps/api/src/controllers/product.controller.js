import { ProductService } from '../services/product.service';
export const productController = {
    async search(c) {
        const user = c.get('user');
        const query = c.req.query('q') || '';
        const products = await ProductService.searchProducts(user.tenantId, query);
        return c.json({ data: products });
    },
    async getById(c) {
        const user = c.get('user');
        const id = c.req.param('id');
        const product = await ProductService.getProductById(user.tenantId, id);
        if (!product) {
            return c.json({ error: 'Product not found' }, 404);
        }
        return c.json({ data: product });
    },
    async create(c) {
        const user = c.get('user');
        const body = await c.req.json();
        try {
            const product = await ProductService.createProduct({
                ...body,
                tenantId: user.tenantId
            });
            return c.json({ message: 'Product created', data: product }, 201);
        }
        catch (error) {
            if (error.message?.includes('duplicate key') && error.message?.includes('sku')) {
                return c.json({ error: 'SKU sudah digunakan oleh produk lain. Silakan gunakan SKU yang berbeda atau kosongkan SKU.' }, 400);
            }
            return c.json({ error: error.message }, 400);
        }
    },
    async update(c) {
        const user = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();
        try {
            const product = await ProductService.updateProduct(user.tenantId, id, body);
            if (!product)
                return c.json({ error: 'Product not found' }, 404);
            return c.json({ message: 'Product updated', data: product });
        }
        catch (error) {
            if (error.message?.includes('duplicate key') && error.message?.includes('sku')) {
                return c.json({ error: 'SKU sudah digunakan oleh produk lain. Silakan gunakan SKU yang berbeda atau kosongkan SKU.' }, 400);
            }
            return c.json({ error: error.message }, 400);
        }
    },
    async delete(c) {
        const user = c.get('user');
        const id = c.req.param('id');
        try {
            const product = await ProductService.deleteProduct(user.tenantId, id);
            if (!product)
                return c.json({ error: 'Product not found' }, 404);
            return c.json({ message: 'Product deleted', data: product });
        }
        catch (error) {
            return c.json({ error: error.message }, 400);
        }
    }
};
