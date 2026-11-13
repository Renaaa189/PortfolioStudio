/**
 * Crea una cuenta demo con un portfolio de ejemplo ya publicado.
 * Usa los services, así los datos pasan por las mismas validaciones que la API.
 * Uso: npm run db:seed
 */
import { pool } from '../src/config/db.js';
import { projectService } from '../src/services/project.service.js';
import { skillService } from '../src/services/skill.service.js';
import { certificateService } from '../src/services/certificate.service.js';
import { profileService } from '../src/services/profile.service.js';
import * as userRepo from '../src/repositories/user.repository.js';
import { authService } from '../src/services/auth.service.js';

const projects = [
  {
    name: 'Nebula Commerce',
    description: 'E-commerce headless con carrito en tiempo real, pagos con Stripe y panel de administración para gestionar stock y pedidos.',
    category: 'Full Stack',
    technologies: ['React', 'Node.js', 'Express', 'MySQL', 'Stripe'],
    githubUrl: 'https://github.com/example/nebula-commerce',
    demoUrl: 'https://example.com/nebula',
    date: '2025-09-14',
    status: 'finalizado',
    featured: true,
  },
  {
    name: 'Aurora Dashboard',
    description: 'Dashboard de analítica con gráficos interactivos, filtros combinables y exportación a CSV para equipos de marketing.',
    category: 'Frontend',
    technologies: ['React', 'Vite', 'D3.js', 'CSS'],
    githubUrl: 'https://github.com/example/aurora-dashboard',
    demoUrl: 'https://example.com/aurora',
    date: '2025-05-02',
    status: 'finalizado',
    featured: true,
  },
  {
    name: 'Pulse API',
    description: 'API REST en capas (routes, controllers, services, repositories) con autenticación JWT, rate limiting y tests automatizados.',
    category: 'Backend',
    technologies: ['Node.js', 'Express', 'MySQL', 'JWT'],
    githubUrl: 'https://github.com/example/pulse-api',
    date: '2025-11-20',
    status: 'en_progreso',
    featured: true,
  },
  {
    name: 'Lumen Design System',
    description: 'Sistema de diseño con tokens, componentes accesibles y documentación viva. Soporta tema claro y oscuro.',
    category: 'Diseño UX/UI',
    technologies: ['Figma', 'React', 'Storybook', 'CSS'],
    githubUrl: 'https://github.com/example/lumen-ds',
    date: '2024-10-08',
    status: 'finalizado',
    featured: false,
  },
  {
    name: 'Orbit Tasks',
    description: 'App de tareas colaborativa con tableros kanban, arrastrar y soltar y sincronización entre dispositivos.',
    category: 'Full Stack',
    technologies: ['React', 'TypeScript', 'Node.js', 'WebSockets'],
    githubUrl: 'https://github.com/example/orbit-tasks',
    demoUrl: 'https://example.com/orbit',
    date: '2024-06-17',
    status: 'pausado',
    featured: false,
  },
  {
    name: 'Solaris Weather',
    description: 'Clima en tiempo real con geolocalización, pronóstico extendido y animaciones según el estado del cielo.',
    category: 'Frontend',
    technologies: ['JavaScript', 'CSS', 'API REST'],
    githubUrl: 'https://github.com/example/solaris-weather',
    demoUrl: 'https://example.com/solaris',
    date: '2024-02-11',
    status: 'finalizado',
    featured: false,
  },
  {
    name: 'Mira Mobile',
    description: 'App móvil para reservar turnos en estudios de diseño, con notificaciones push y pagos integrados.',
    category: 'Mobile',
    technologies: ['React Native', 'TypeScript', 'Firebase'],
    date: '2026-03-03',
    status: 'en_progreso',
    featured: true,
  },
];

const skills = [
  ['React', 'Frontend', 'experto', '⚛️'],
  ['JavaScript', 'Frontend', 'experto', '🟨'],
  ['TypeScript', 'Frontend', 'avanzado', '🔷'],
  ['CSS / Animaciones', 'Frontend', 'avanzado', '🎨'],
  ['Node.js', 'Backend', 'avanzado', '🟩'],
  ['Express', 'Backend', 'avanzado', '🚂'],
  ['MySQL', 'Base de datos', 'avanzado', '🐬'],
  ['MongoDB', 'Base de datos', 'intermedio', '🍃'],
  ['Git & GitHub', 'Herramientas', 'experto', '🐙'],
  ['Docker', 'Herramientas', 'intermedio', '🐳'],
  ['Figma', 'Diseño', 'avanzado', '✏️'],
  ['UX Research', 'Diseño', 'intermedio', '🔍'],
  ['Testing', 'Backend', 'intermedio', '🧪'],
  ['Inglés', 'Idiomas', 'avanzado', '🌎'],
].map(([name, category, level, icon]) => ({ name, category, level, icon }));

const certificates = [
  {
    name: 'Desarrollo Full Stack',
    institution: 'Generación T',
    date: '2026-07-15',
    description: 'Programa intensivo de desarrollo web: React, Node.js, Express, bases de datos y buenas prácticas con IA.',
  },
  {
    name: 'JavaScript Algorithms and Data Structures',
    institution: 'freeCodeCamp',
    date: '2025-03-22',
    description: 'Algoritmos, estructuras de datos y programación funcional en JavaScript.',
  },
  {
    name: 'Google UX Design',
    institution: 'Google / Coursera',
    date: '2024-11-30',
    description: 'Proceso de diseño centrado en el usuario: investigación, wireframes, prototipos y testing.',
  },
  {
    name: 'Bases de datos relacionales con MySQL',
    institution: 'Platzi',
    date: '2024-08-05',
    description: 'Modelado relacional, normalización, consultas avanzadas e índices.',
  },
];

const DEMO = {
  username: 'valentina',
  email: 'demo@portfoliostudio.dev',
  password: 'Demo1234!',
  firstName: 'Valentina',
  lastName: 'Ríos',
};

async function seed() {
  let user = await userRepo.findByUsername(DEMO.username);
  if (user) {
    console.log(`ℹ La cuenta demo ya existe: ${DEMO.email} / ${DEMO.password}`);
    return;
  }

  ({ user } = await authService.register(DEMO));

  await profileService.update(user.id, {
    role: 'Desarrolladora Full Stack & UX',
    bio: 'Construyo productos digitales rápidos, accesibles y con mucha personalidad. Me encanta unir diseño y código: desde la primera idea en Figma hasta la API en producción.',
    location: 'Buenos Aires, Argentina',
    github: 'https://github.com/example',
    linkedin: 'https://www.linkedin.com/in/example',
    website: 'https://example.com',
  });
  await profileService.setPublished(user.id, { published: true });

  for (const item of projects) await projectService.create(user.id, item);
  for (const item of skills) await skillService.create(user.id, item);
  for (const item of certificates) await certificateService.create(user.id, item);

  console.log(`✔ Cuenta demo creada con ${projects.length} proyectos, ${skills.length} habilidades y ${certificates.length} certificados.`);
  console.log(`  Ingresá con ${DEMO.email} / ${DEMO.password}`);
  console.log(`  Portfolio público: /p/${DEMO.username}`);
}

seed()
  .catch((err) => {
    console.error(`✖ Error cargando datos de ejemplo: ${err.message}`, err.details ?? '');
    process.exitCode = 1;
  })
  .finally(() => pool.end());
