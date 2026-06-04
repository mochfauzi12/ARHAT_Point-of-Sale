import { Hono } from 'hono';
import { transactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth';

const transactionRoutes = new Hono();

// All transaction routes require authentication
transactionRoutes.use('*', authMiddleware);

transactionRoutes.post('/', transactionController.create);
transactionRoutes.post('/:id/checkout', transactionController.checkout);

export default transactionRoutes;
