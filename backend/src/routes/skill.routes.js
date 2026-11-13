import { Router } from 'express';
import { createCrudController } from '../controllers/crud.controller.js';
import { skillService } from '../services/skill.service.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();
const controller = createCrudController(skillService);

router.use(requireAuth);

router.get('/', controller.list);
router.get('/categories', async (req, res) => res.json(await skillService.categories(req.user.id)));
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
