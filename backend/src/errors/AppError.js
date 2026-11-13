/**
 * Error de negocio controlado. El errorHandler lo convierte en una respuesta
 * HTTP con el status y el mensaje indicados.
 */
export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message = 'Solicitud inválida', details) {
    return new AppError(400, message, details);
  }

  static validation(details) {
    return new AppError(400, 'Revisá los datos del formulario', details);
  }

  static unauthorized(message = 'Necesitás iniciar sesión') {
    return new AppError(401, message);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new AppError(404, message);
  }

  static conflict(message, details) {
    return new AppError(409, message, details);
  }
}
