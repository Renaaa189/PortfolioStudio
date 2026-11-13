# ✦ Portfolio Studio

Plataforma web para **crear portfolios profesionales sin tocar código**. Cualquier persona se registra, carga sus
proyectos, habilidades y certificados desde su panel, y obtiene un portfolio moderno con su propio link
(`/p/su-usuario`) que puede actualizar cuando quiera, sin volver a desplegar nada.

- **Frontend:** React 19 + Vite + CSS puro (tema claro/oscuro, aurora animada, destellos, glassmorphism)
- **Backend:** Node.js + Express 5, arquitectura en capas `Routes → Controller → Service → Repository`
- **Base de datos:** MySQL 8 (o MariaDB 10.6+)
- **Auth:** registro y login con JWT + bcrypt

## Funcionalidades

| Área | Qué incluye |
|---|---|
| Cuentas | Registro con nombre de usuario (forma el link público), login con JWT. Cada usuario ve y edita **solo sus datos** |
| Página de inicio | Presenta la app: cómo funciona, funciones y llamados a crear la cuenta |
| Proyectos | CRUD, imagen (subida o URL), tecnologías como etiquetas, destacar con un clic, búsqueda por nombre/tecnología/categoría/estado, filtros por tecnología, año, estado, categoría y destacados, orden y paginación |
| Habilidades | CRUD agrupado por categoría, nivel (básico → experto), ícono emoji o imagen |
| Certificados | CRUD con imagen y archivo PDF |
| Perfil | Nombre, foto, cargo, bio, ubicación, email, GitHub, LinkedIn, sitio web, cambio de contraseña |
| Dashboard | Totales animados, tecnologías más usadas, proyectos por estado/año, habilidades por nivel, actividad reciente |
| Diseño | Editor con **vista previa en vivo** (escritorio, tablet y celular): 8 paletas de colores, 6 fondos, 5 tipografías y **5 plantillas para cada sección** (portada, tecnologías, destacados, proyectos, habilidades, certificados y contacto). Además se puede cambiar el orden de las secciones y ocultarlas |
| Publicación | Vista previa antes de publicar, botón publicar/despublicar y link para copiar. Un portfolio sin publicar no es visible en `/p/:usuario` |
| General | Tema claro y oscuro, responsive, validación en cliente **y** servidor con mensajes por campo, toasts, estados de carga/vacío/error |

## Puesta en marcha

Requisitos: **Node.js 20+** y **MySQL 8** (o MariaDB) corriendo.

```bash
npm run install:all
```

```bash
cp backend/.env.example backend/.env
```

Editá `backend/.env` con tu usuario y contraseña de MySQL (y cambiá `JWT_SECRET`). Después:

```bash
npm run setup
```

Crea la base, las tablas y una **cuenta demo** con un portfolio de ejemplo ya publicado (si no la querés, corré solo
`npm --prefix backend run db:setup`).

> Si ya habías creado la base con la versión anterior (de un solo usuario), ejecutá `npm run db:reset`
> para recrearla y después `npm run setup`.

```bash
npm run dev
```

- Página de inicio: http://localhost:5173
- Crear cuenta: http://localhost:5173/registro
- Panel de cada usuario: http://localhost:5173/admin
- Portfolio público de ejemplo: http://localhost:5173/p/valentina
- Cuenta demo: `demo@portfoliostudio.dev` / `Demo1234!`

> Al arrancar, el servidor aplica solo los cambios de esquema pendientes (por ejemplo, la columna `design`) sin borrar datos.

### Producción

```bash
npm run build && npm start
```

Express sirve la API y el frontend compilado en el mismo puerto (`PORT`, por defecto 4000).

### Tests

```bash
npm test
```

36 tests con `node:test`: validadores, reglas de negocio del service (con repositorio falso) e integración HTTP real contra MySQL
(usa la base `portfolio_studio_test`; si MySQL no está disponible esos tests se saltean).

## API

Todas las rutas salvo `register`, `login`, `health` y `public/portfolios/:username` requieren `Authorization: Bearer <token>`
y operan **solo sobre los datos del usuario del token**.

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crea la cuenta (`firstName`, `lastName`, `username`, `email`, `password`) → `{ token, user }` |
| POST | `/api/auth/login` | Devuelve `{ token, user }` |
| GET | `/api/auth/me` | Usuario actual |
| PUT | `/api/auth/password` | Cambiar contraseña |
| GET | `/api/projects` | Lista con `q`, `technology`, `year`, `status`, `category`, `featured`, `sort`, `page`, `limit` → `{ data, meta }` |
| GET | `/api/projects/filters` | Valores disponibles para los filtros |
| GET/POST/PUT/PATCH/DELETE | `/api/projects/:id` | CRUD (PATCH = actualización parcial) |
| GET/POST/PUT/PATCH/DELETE | `/api/skills[/:id]` | CRUD de habilidades |
| GET/POST/PUT/PATCH/DELETE | `/api/certificates[/:id]` | CRUD de certificados |
| GET/PUT | `/api/profile` | Ver/editar perfil |
| PATCH | `/api/profile/publish` | `{ published: true \| false }` |
| PUT | `/api/profile/design` | Guarda el diseño (`palette`, `background`, `font`, `layouts`, `order`, `hidden`); acepta cambios parciales |
| GET | `/api/design/options` | Opciones de diseño disponibles y valores por defecto |
| GET | `/api/dashboard/stats` | Estadísticas |
| GET | `/api/portfolio/preview` | Portfolio completo aunque no esté publicado |
| GET | `/api/public/portfolios/:username` | Portfolio público de un usuario (404 si no existe o no está publicado) |
| POST | `/api/uploads/image` · `/api/uploads/pdf` | Subida multipart (campo `file`), máx. 5 MB / 10 MB |

Errores: `{ "error": { "message": "…", "details": { "campo": "mensaje" } } }` con 400, 401, 404, 409, 413, 429 o 500.

### Reglas de negocio

- Email y nombre de usuario únicos. Usuario: 3 a 30 caracteres, minúsculas, números y guiones, sin palabras reservadas (`admin`, `api`, `login`…).
- Nombre de proyecto y de habilidad únicos **dentro de cada cuenta** (dos usuarios pueden tener un proyecto con el mismo nombre).
- Fechas válidas y **no futuras**.
- URLs `http(s)` válidas (o archivos subidos a `/uploads`); GitHub/LinkedIn del perfil deben ser de esos dominios.
- Estado del proyecto: `en_progreso`, `finalizado` o `pausado`. Nivel: `basico`, `intermedio`, `avanzado`, `experto`.
- Tecnologías normalizadas en tablas `technologies` + `project_technologies` (muchos a muchos), sin duplicados.

## Estructura

```
backend/
  database/        schema.sql, setup/reset de la base, seed (cuenta demo)
  src/
    config/        env y pool de MySQL
    routes/        definición de endpoints
    controllers/   capa HTTP
    services/      validación y reglas de negocio
    repositories/  único lugar con SQL (consultas parametrizadas)
    middlewares/   auth JWT, rate limit, manejo de errores
    errors/        AppError
  tests/
frontend/
  src/
    api/           cliente HTTP y servicios por entidad
    context/       auth, tema y notificaciones
    hooks/         useAsync, useForm, useDebounce, useReveal
    components/    ui/ (reutilizables), layout/ (admin), portfolio/ (vista pública)
    pages/         admin/ y public/
    styles/        tokens, base, componentes, admin, portfolio
docs/              entregas de las actividades del Módulo 3
.cursor/agents/    subagente revisor
```

## Seguridad

- Rutas del panel protegidas con JWT; cada consulta SQL filtra por `user_id`, así nadie puede leer ni modificar datos de otra cuenta (hay un test que lo verifica).
- CORS restringido a los orígenes de `CORS_ORIGIN`.
- Paginación con tope (`limit` máx. 50) en `GET /api/projects`.
- Consultas SQL parametrizadas y comodines `LIKE` escapados.
- Contraseñas con bcrypt, rate limit en registro y login y respuesta de tiempo constante ante emails inexistentes.
- Subidas con tipo MIME validado, tamaño máximo y nombre aleatorio generado por el servidor.
