import { Hono } from 'hono';
import { productController } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth';

const productRoutes = new Hono();

// All product routes require authentication
productRoutes.use('*', authMiddleware);

productRoutes.get('/search', productController.search);
productRoutes.get('/:id', productController.getById);
productRoutes.post('/', productController.create);

export default productRoutes;
