import * as defaultRepo from '../repositories/certificate.repository.js';
import { AppError } from '../errors/AppError.js';
import { Validator, clean, escapeLike } from '../utils/validators.js';

const sanitize = (i) => ({
  name: clean(i.name),
  institution: clean(i.institution),
  date: clean(i.date),
  description: clean(i.description),
  image: clean(i.image),
  pdfFile: clean(i.pdfFile),
});

function validate(c) {
  const v = new Validator();
  v.required('name', c.name, 'El nombre es obligatorio').maxLength('name', c.name, 150);
  v.required('institution', c.institution, 'La institución es obligatoria').maxLength('institution', c.institution, 150);
  v.pastDate('date', c.date, { required: true });
  v.maxLength('description', c.description, 2000);
  v.url('image', c.image, { asset: true }).maxLength('image', c.image, 500);
  v.url('pdfFile', c.pdfFile, { asset: true }).maxLength('pdfFile', c.pdfFile, 500);
  if (c.pdfFile && c.pdfFile.startsWith('/uploads/')) {
    v.check('pdfFile', c.pdfFile.toLowerCase().endsWith('.pdf'), 'El archivo debe ser un PDF');
  }
  v.throwIfAny();
}

export function createCertificateService(repo = defaultRepo) {
  async function getById(userId, id) {
    const cert = await repo.findById(userId, id);
    if (!cert) throw AppError.notFound('El certificado no existe');
    return cert;
  }

  return {
    list: (userId, query = {}) => repo.findAll(userId, { q: clean(query.q) ? escapeLike(clean(query.q)) : null }),
    getById,
    async create(userId, input) {
      const cert = sanitize(input);
      validate(cert);
      return repo.create(userId, cert);
    },
    async update(userId, id, input) {
      const current = await getById(userId, id);
      const cert = sanitize({ ...current, ...input });
      validate(cert);
      return repo.update(userId, id, cert);
    },
    async remove(userId, id) {
      if (!(await repo.remove(userId, id))) throw AppError.notFound('El certificado no existe');
    },
  };
}

export const certificateService = createCertificateService();
