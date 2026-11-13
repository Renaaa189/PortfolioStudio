import * as userRepo from '../repositories/user.repository.js';
import * as projectRepo from '../repositories/project.repository.js';
import * as skillRepo from '../repositories/skill.repository.js';
import * as certificateRepo from '../repositories/certificate.repository.js';
import * as dashboardRepo from '../repositories/dashboard.repository.js';
import { AppError } from '../errors/AppError.js';
import { normalizeUsername } from '../utils/username.js';

async function build(profile) {
  const [{ items: projects }, skills, certificates] = await Promise.all([
    projectRepo.findAll(profile.id, { page: 1, limit: 200, sort: 'recent' }),
    skillRepo.findAll(profile.id),
    certificateRepo.findAll(profile.id),
  ]);
  const { id, updatedAt, ...publicProfile } = profile;
  return { profile: publicProfile, projects, skills, certificates };
}

/** Arma el portfolio de un usuario: la vista pública exige que esté publicado; la vista previa no. */
export const portfolioService = {
  async getPublic(username) {
    const profile = await userRepo.findByUsername(normalizeUsername(username));
    if (!profile || !profile.isPublished) {
      throw AppError.notFound('Este portfolio no existe o todavía no fue publicado');
    }
    return build(profile);
  },

  async getPreview(userId) {
    const profile = await userRepo.findById(userId);
    if (!profile) throw AppError.notFound('Perfil no encontrado');
    return build(profile);
  },

  stats: (userId) => dashboardRepo.getStats(userId),
};
