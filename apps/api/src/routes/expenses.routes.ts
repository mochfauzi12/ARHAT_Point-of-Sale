import { Hono } from 'hono';
import { expensesController } from '../controllers/expenses.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const expensesRoutes = new Hono();

expensesRoutes.use('/*', authMiddleware);

expensesRoutes.get('/', expensesController.getExpenses);
expensesRoutes.post('/', expensesController.createExpense);
expensesRoutes.put('/:id', expensesController.updateExpense);
expensesRoutes.delete('/:id', expensesController.deleteExpense);

export default expensesRoutes;
