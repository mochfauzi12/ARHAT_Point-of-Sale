import { Hono } from 'hono';
import { transactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth';
const transactionRoutes = new Hono();
// All transaction routes require authentication
transactionRoutes.use('*', authMiddleware);
transactionRoutes.get('/', transactionController.list);
transactionRoutes.post('/', transactionController.create);
transactionRoutes.post('/offline-sync', transactionController.offlineSync);
transactionRoutes.post('/:id/checkout', transactionController.checkout);
transactionRoutes.post('/hold', transactionController.hold);
transactionRoutes.get('/held', transactionController.getHeld);
transactionRoutes.post('/:id/resume', transactionController.resume);
transactionRoutes.post('/:id/refund', transactionController.refund);
transactionRoutes.post('/:id/void', transactionController.voidTransaction);
export default transactionRoutes;
