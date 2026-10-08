# Hotel Incontrastable — demo técnica

Aplicación multipágina de demostración para consultar habitaciones, servicios y promociones de un hotel ficticio en Huancayo. El frontend estático se despliega en Vercel y obtiene la información desde una API ASP.NET Core desplegada en Render. La API usa datos de ejemplo en memoria y no requiere una base de datos.

## Tecnologías

- API REST: ASP.NET Core sobre .NET 10, organizada en controladores y servicios.
- Frontend: HTML, CSS, JavaScript y Bootstrap.
- Contenedores: Docker.
- Despliegue de la API: Render.
- Despliegue del frontend: Vercel.

## Páginas del sitio

- `index.html`: portada y accesos a las secciones.
- `habitaciones.html`: catálogo con búsqueda, filtros, detalle y selección de habitaciones.
- `servicios.html`: servicios incluidos y disponibles a solicitud.
- `promociones.html`: descuentos de demostración.

La selección se conserva durante la navegación en la misma pestaña del navegador. No hay autenticación ni persistencia de reservas; la reserva es una simulación local.

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

La dirección local de la API está en `frontend/config.js`. `npm run build` genera las cuatro páginas HTML y sus recursos en `frontend/dist`, y crea un `config.js` con la dirección indicada por `API_BASE_URL`.

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

## Despliegue de la API en Render

El archivo `render.yaml` define el servicio web Docker de la API, que utiliza el `Dockerfile` de la raíz y escucha en el puerto 8080. La API se publica bajo rutas como `/api/productos` y `/api/salud`; el frontend no se construye ni se sirve desde este contenedor.

Después de desplegar el frontend en Vercel, agrega en las variables de entorno del servicio Render:

- `FRONTEND_ORIGINS`: el dominio de producción asignado por Vercel, por ejemplo `https://nombre-del-proyecto.vercel.app`. Si se necesitan varios orígenes, sepáralos con comas. No incluyas una barra final.

Los orígenes locales `http://localhost:5173` y `http://127.0.0.1:5173` se permiten por defecto cuando la variable no está configurada. Para producción, configura el dominio Vercel exacto en Render y vuelve a desplegar o reinicia el servicio para aplicar el cambio.

## Despliegue del frontend en Vercel

1. Importa el repositorio de GitHub como un nuevo proyecto Vercel.
2. Configura **Root Directory** como `frontend`.
3. Usa el comando de construcción `npm run build` y el directorio de salida `dist`; estos valores también están declarados en `frontend/vercel.json`.
4. Añade la variable de entorno `API_BASE_URL` con la URL HTTPS de la API en Render: `https://ev-parcial-hotel-incontrastable-oscategui.onrender.com` (sin barra final). Configúrala para Production y, si corresponde, Preview.
5. Despliega el proyecto en Vercel.
6. Copia el dominio Vercel de producción a `FRONTEND_ORIGINS` en el servicio API de Render y aplica el cambio.

El build de Vercel falla intencionalmente si falta `API_BASE_URL` o si no utiliza HTTPS, para evitar publicar silenciosamente una interfaz que intente llamar a `localhost`. Los datos de la API son de ejemplo y se reinician con cada proceso; esta versión no incluye almacenamiento persistente ni autenticación.
