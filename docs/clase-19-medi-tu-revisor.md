# Clase 19 — Medí tu revisor

## Casos de prueba
| Archivo | Tipo | Qué debería encontrar |
|---|---|---|
| `project.routes.js` | Con problema | POST, PUT y DELETE no piden autenticación |
| `app.js` | Con problema | `cors()` abierto a cualquier origen |
| `project.repository.js` | Con problema | `findAll` sin `LIMIT` ni paginación |
| `project.controller.js` | Sano | Nada grave |
| `AppError.js` | Sano | Nada grave |

> ⚠️ En la versión actual del proyecto esos tres problemas **ya están corregidos** (JWT en todas las rutas del admin,
> CORS restringido con `CORS_ORIGIN` y paginación con tope de 50). Para repetir la medición, crea una rama aparte y reintroducilos:
> - `backend/src/routes/project.routes.js`: borrá `router.use(requireAuth);`
> - `backend/src/app.js`: reemplazá el bloque `cors({...})` por `cors()`
> - `backend/src/repositories/project.repository.js`: quitá `LIMIT ? OFFSET ?` de `findAll` (y los dos parámetros)

## Resultados (completar)
| Medición | Aciertos (de 5) | Notas |
|---|---|---|
| 1. Revisor original (chat nuevo) | _ / 5 | |
| Línea cambiada en el revisor | — | _cuál y por qué_ |
| 2. Revisor modificado (otro chat nuevo) | _ / 5 | |
