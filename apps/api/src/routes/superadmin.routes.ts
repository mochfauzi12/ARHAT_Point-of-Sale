import { Hono } from 'hono';
import { getTenants, deactivateTenant, activateTenant, deleteTenant } from '../controllers/superadmin.controller';
import { authMiddleware } from '../middleware/auth';

const router = new Hono();

router.use('/*', authMiddleware);
router.get('/tenants', getTenants);
router.patch('/tenants/:id/deactivate', deactivateTenant);
router.patch('/tenants/:id/activate', activateTenant);
router.delete('/tenants/:id', deleteTenant);

export default router;
