import { parseId } from '../utils/validators.js';

/**
 * Controller CRUD genérico. Cada operación recibe el id del usuario logueado,
 * así nadie puede leer ni modificar datos de otra cuenta.
 */
export function createCrudController(service) {
  return {
    list: async (req, res) => res.json(await service.list(req.user.id, req.query)),
    getById: async (req, res) => res.json(await service.getById(req.user.id, parseId(req.params.id))),
    create: async (req, res) => res.status(201).json(await service.create(req.user.id, req.body ?? {})),
    update: async (req, res) => res.json(await service.update(req.user.id, parseId(req.params.id), req.body ?? {})),
    remove: async (req, res) => {
      await service.remove(req.user.id, parseId(req.params.id));
      res.status(204).end();
    },
  };
}
