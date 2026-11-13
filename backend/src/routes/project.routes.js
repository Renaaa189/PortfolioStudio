import { Router } from 'express';
import * as controller from '../controllers/project.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', controller.list);
router.get('/filters', controller.filterOptions);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
