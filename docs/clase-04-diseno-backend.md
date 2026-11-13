# Clase 4 — Diseñando el backend

## 1. Análisis del frontend
- **Funcionalidades:** CRUD de proyectos, habilidades y certificados; edición de perfil; búsqueda y filtros de proyectos; dashboard; vista previa; tema claro/oscuro; login.
- **Entidades:** Proyecto, Habilidad, Certificado, Usuario (perfil).
- **Persistencia antes del backend:** estado de React + `localStorage`, que se pierde al cambiar de navegador o limpiar datos y no se puede compartir.

## 2. Reparto de responsabilidades
| Frontend | Backend |
|---|---|
| Pantallas, navegación, tema | Validación definitiva y reglas de negocio |
| Feedback inmediato de formularios | Persistencia en MySQL |
| Filtros visuales en el portfolio público | Búsqueda, filtros y paginación del admin |
| Estados de carga/vacío/error | Estadísticas del dashboard, autenticación |

## 3. Endpoints REST
`/api/projects`, `/api/skills`, `/api/certificates`, `/api/profile`, `/api/dashboard/stats`, `/api/auth/login`,
más `/api/auth/register` y `/api/public/portfolios/:username` para que cada usuario tenga su propio portfolio.
La búsqueda y los filtros son parámetros de `GET /api/projects` (`q`, `technology`, `year`, `status`, `category`, `featured`, `page`, `limit`, `sort`).
Detalle completo en el [README](../README.md#api).

## 4. Arquitectura en capas
`Routes → Controller → Service → Repository → MySQL`
- **Controller:** solo HTTP (lee `req`, responde `res`).
- **Service:** validación y reglas de negocio. Recibe el repository por parámetro, por eso se testea sin base de datos.
- **Repository:** el único que escribe SQL.

## 5. Decisión de la IA cuestionada
La IA propuso guardar las tecnologías como texto separado por comas. Se reemplazó por la tabla `technologies` y la intermedia
`project_technologies` (muchos a muchos), porque:
- filtrar por tecnología con `LIKE '%React%'` daría falsos positivos (`React Native`);
- el dashboard necesita contar proyectos por tecnología con un `GROUP BY`;
- evita duplicados como `react` / `React`.

## 6. Reglas aplicadas
Nombre único, fecha no futura, URLs válidas y estado `en_progreso`, `finalizado` o `pausado`.

## 7. Evidencia
`npm test` → **36 tests, 36 pasan** (validadores, service con repositorio falso e integración HTTP contra MySQL).
