import { Router } from 'express';
import projectRoutes from './project.routes.js';
import skillRoutes from './skill.routes.js';
import certificateRoutes from './certificate.routes.js';
import uploadRoutes from './upload.routes.js';
import { requireAuth } from '../middlewares/auth.js';
import { rateLimit } from '../middlewares/rateLimit.js';
import { authService } from '../services/auth.service.js';
import { profileService } from '../services/profile.service.js';
import { portfolioService } from '../services/portfolio.service.js';
import { env } from '../config/env.js';
import { DESIGN_OPTIONS, DEFAULT_DESIGN, SECTIONS } from '../utils/design.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth
const authLimit = rateLimit({ max: env.isTest ? 1000 : 10 });
router.post('/auth/register', authLimit, async (req, res) => {
  res.status(201).json(await authService.register(req.body));
});
router.post('/auth/login', authLimit, async (req, res) => {
  res.json(await authService.login(req.body));
});
router.get('/auth/me', requireAuth, async (req, res) => res.json(await authService.me(req.user.id)));
router.put('/auth/password', requireAuth, async (req, res) => {
  await authService.changePassword(req.user.id, req.body);
  res.status(204).end();
});

// Perfil
router.get('/profile', requireAuth, async (req, res) => res.json(await profileService.get(req.user.id)));
router.put('/profile', requireAuth, async (req, res) => res.json(await profileService.update(req.user.id, req.body)));
router.put('/profile/design', requireAuth, async (req, res) =>
  res.json(await profileService.updateDesign(req.user.id, req.body)),
);
router.get('/design/options', (req, res) => res.json({ ...DESIGN_OPTIONS, sections: SECTIONS, defaults: DEFAULT_DESIGN }));
router.patch('/profile/publish', requireAuth, async (req, res) =>
  res.json(await profileService.setPublished(req.user.id, req.body)),
);

// Dashboard y vista previa (privados)
router.get('/dashboard/stats', requireAuth, async (req, res) => res.json(await portfolioService.stats(req.user.id)));
router.get('/portfolio/preview', requireAuth, async (req, res) => res.json(await portfolioService.getPreview(req.user.id)));

// Portfolio público de cada usuario
router.get('/public/portfolios/:username', async (req, res) =>
  res.json(await portfolioService.getPublic(req.params.username)),
);

router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/certificates', certificateRoutes);
router.use('/uploads', uploadRoutes);

export default router;
