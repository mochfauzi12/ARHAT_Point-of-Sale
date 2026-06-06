import { Hono } from 'hono';
import { productController } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth';
const productRoutes = new Hono();
// All product routes require authentication
productRoutes.use('*', authMiddleware);
productRoutes.get('/search', productController.search);
// For dashboard list, we can just use search without query to return all active products (MVP)
productRoutes.get('/', productController.search);
productRoutes.get('/:id', productController.getById);
productRoutes.post('/', productController.create);
productRoutes.put('/:id', productController.update);
productRoutes.delete('/:id', productController.delete);
export default productRoutes;
