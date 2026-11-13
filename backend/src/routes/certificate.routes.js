import { Router } from 'express';
import { createCrudController } from '../controllers/crud.controller.js';
import { certificateService } from '../services/certificate.service.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
const controller = createCrudController(certificateService);

router.use(requireAuth);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
