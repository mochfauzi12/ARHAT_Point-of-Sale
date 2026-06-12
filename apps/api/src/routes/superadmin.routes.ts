import { Hono } from 'hono';
import { getTenants } from '../controllers/superadmin.controller';
import { authMiddleware } from '../middleware/auth';

const router = new Hono();

router.use('/*', authMiddleware);
router.get('/tenants', getTenants);

export default router;
