import { projectService } from '../services/project.service.js';
import { createCrudController } from './crud.controller.js';

/** Capa HTTP de proyectos: el CRUD genérico más las opciones de filtros. */
const crud = createCrudController(projectService);

export const { list, getById, create, update, remove } = crud;

export async function filterOptions(req, res) {
  res.json(await projectService.filterOptions(req.user.id));
}
