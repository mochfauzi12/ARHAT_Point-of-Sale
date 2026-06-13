import { Hono } from 'hono';
import { getTenants, deactivateTenant, activateTenant, deleteTenant, bulkDeactivateTenants, bulkActivateTenants, bulkDeleteTenants } from '../controllers/superadmin.controller';
import { authMiddleware } from '../middleware/auth';

const router = new Hono();

router.use('/*', authMiddleware);
router.get('/tenants', getTenants);
router.post('/tenants/bulk-deactivate', bulkDeactivateTenants);
router.post('/tenants/bulk-activate', bulkActivateTenants);
router.post('/tenants/bulk-delete', bulkDeleteTenants);
router.patch('/tenants/:id/deactivate', deactivateTenant);
router.patch('/tenants/:id/activate', activateTenant);
router.delete('/tenants/:id', deleteTenant);

export default router;
