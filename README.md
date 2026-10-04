# Hotel Incontrastable — demo técnica

Aplicación multipágina de demostración para consultar habitaciones, servicios y promociones de un hotel ficticio en Huancayo. El frontend obtiene la información desde una API ASP.NET Core; la API usa datos de ejemplo en memoria y no requiere una base de datos.

## Tecnologías

- API REST: ASP.NET Core sobre .NET 10, organizada en controladores y servicios.
- Frontend: HTML, CSS, JavaScript y Bootstrap.
- Contenedores y despliegue: Docker y Render.

## Páginas del sitio

- `index.html`: portada y accesos a las secciones.
- `habitaciones.html`: catálogo con búsqueda, filtros, detalle y selección de habitaciones.
- `servicios.html`: servicios incluidos y disponibles a solicitud.
- `promociones.html`: descuentos de demostración.

La selección se conserva durante la navegación en la misma pestaña del navegador. El login aún no está implementado; se definirá en una etapa posterior.

## Ejecutar localmente

Requiere .NET 10 SDK y Node.js.

1. Inicia la API desde la carpeta del proyecto:

   ```powershell
   dotnet run --project backend\HotelIncontrastable.Api --urls http://localhost:5050
   ```

2. En otra terminal, inicia el frontend:

   ```powershell
   cd frontend
   npm run dev
   ```

3. Abre <http://localhost:5173> y navega entre las páginas desde el menú principal.

La dirección local de la API está en `frontend/config.js`. Para una publicación estática en Render, `npm run build` toma la variable `API_BASE_URL`, genera las cuatro páginas HTML en `frontend/dist` e incorpora la dirección al archivo de configuración generado.

## Endpoints

| Método | Endpoint | Uso |
| --- | --- | --- |
| GET | `/api/productos` | Lista paginada de habitaciones; admite `q`, `categoriaId`, `huespedes`, `precioMin`, `precioMax`, `orden`, `pagina` y `tamanoPagina`. |
| GET | `/api/productos/{id}` | Detalle de una habitación. |
| GET | `/api/categorias` | Categorías de habitaciones. |
| GET | `/api/servicios` | Servicios del hotel. |
| GET | `/api/promociones` | Promociones; admite `productoId`. |
| GET | `/api/salud` | Verificación de disponibilidad de la API. |

Las reservas son una simulación del lado del cliente: se validan fechas, huéspedes y contacto, pero no se envía ni almacena una reserva y no se procesa ningún pago.

## Despliegue en Render

El archivo `render.yaml` define un único servicio Docker en la raíz del repositorio. El contenedor construye el frontend multipágina y la API ASP.NET Core, y sirve ambos desde el mismo origen: la página principal está en `/` y las páginas adicionales en `/habitaciones.html`, `/servicios.html` y `/promociones.html`. El frontend llama a la API con rutas relativas (`/api/...`).

Los datos de la API son de ejemplo y se reinician con cada proceso; esta versión no incluye almacenamiento persistente ni autenticación.
