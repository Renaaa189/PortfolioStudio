# Clase 11 — Analizar antes de pedir

Función analizada: `queryTicketRows()` (TypeScript + SQL Server usando `sqlcmd` con `FOR JSON PATH`). No es parte de Portfolio Studio.

## Problemas encontrados
1. **JSON truncado:** `sqlcmd` corta la salida de `FOR JSON` en ~8000 caracteres. Con suficientes tickets el JSON llega incompleto,
   `JSON.parse` lanza una excepción y `GET /tickets` responde 500.
2. **Un proceso y una conexión por pedido:** cada request lanza `sqlcmd` y abre una conexión nueva (lento, sin pool) y además
   ata el servicio a Windows y a tener `sqlcmd` instalado.
3. **Inyección SQL:** `sqlcmd` no acepta parámetros, así que crear o editar tickets con este patrón obliga a concatenar valores del usuario en el SQL.

## Prompt
> Reescribí `queryTicketRows()` usando el driver `mssql` con un pool de conexiones compartido y consultas parametrizadas.
> Seleccioná columnas explícitas (no `SELECT *` ni `FOR JSON`) y devolvé los registros que entrega el driver.
> **No cambies** la firma de la función ni el controller que la usa. **No agregues** paginación ni otras librerías.
> Explicá en dos líneas cómo se cierra el pool al apagar el servidor.

## Por qué así
El prompt fija el camino (driver + pool + parámetros) y los límites (firma, controller, sin extras), para que la IA no "mejore"
cosas que no pedimos y el cambio se pueda revisar fácil.
