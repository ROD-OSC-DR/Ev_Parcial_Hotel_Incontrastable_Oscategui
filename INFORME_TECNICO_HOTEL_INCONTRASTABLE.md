# Informe técnico: Hotel Incontrastable

## Resumen ejecutivo

El presente informe describe el análisis, diseño, desarrollo, verificación y preparación para el despliegue de **Hotel Incontrastable**, una aplicación web demostrativa para consultar habitaciones, servicios y promociones de un hotel ficticio ubicado en Huancayo, Perú. El proyecto se desarrolló como respuesta a la evaluación parcial de la asignatura **Desarrollo de Aplicaciones Web**.

La solución está compuesta por una API REST construida con ASP.NET Core sobre .NET 10 y una interfaz multipágina desarrollada con HTML, CSS, JavaScript y Bootstrap. La API proporciona información de productos —representados por habitaciones— y de recursos relacionados: categorías, servicios y promociones. La interfaz consume estos endpoints para mostrar el catálogo, permitir búsquedas y filtros, consultar detalles, organizar una selección temporal de habitaciones y completar una simulación de reserva.

El código prepara una arquitectura de despliegue separada: la API ASP.NET Core como servicio Docker en Render y el frontend estático multipágina en Vercel. La publicación de esta configuración está pendiente; el usuario realizará los despliegues. El frontend usa `API_BASE_URL` para llamar a la API y esta restringe CORS a los orígenes configurados. Los datos son demostrativos y viven en memoria; por ello, la solución no incluye base de datos, inicio de sesión, persistencia de reservas ni procesamiento de pagos. Estas decisiones delimitan el alcance académico del prototipo y no deben confundirse con capacidades de un sistema hotelero listo para operar comercialmente.

**Palabras clave:** aplicación web, API REST, ASP.NET Core, hotel, Render, Vercel, Docker, catálogo de habitaciones.

## 1. Introducción

La disponibilidad de información clara sobre habitaciones, precios, servicios y promociones facilita que los potenciales huéspedes evalúen una estadía. En el contexto de esta evaluación, se planteó desarrollar una aplicación web moderna que permita consultar información relacionada con los productos o servicios de una empresa y que obtenga dichos datos desde una API propia desplegada en Render.

Se eligió el sector hotelero y se propuso el **Hotel Incontrastable**, un establecimiento ficticio situado en Huancayo. La aplicación presenta una experiencia de exploración del alojamiento y su oferta sin efectuar transacciones reales. La configuración objetivo aloja la interfaz pública en Vercel y obtiene información de la API desplegada independientemente en Render mediante solicitudes HTTP desde el navegador.

Este documento presenta el problema abordado, los objetivos, el alcance, los requisitos, la arquitectura, el modelo de datos, el funcionamiento de la API y del frontend, el proceso de despliegue, las verificaciones realizadas y las limitaciones conocidas. No incluye la portada académica, que se elaborará por separado, ni materiales audiovisuales.

## 2. Contexto y planteamiento del problema

Un visitante que desea conocer una propuesta de alojamiento necesita encontrar en un mismo lugar información básica de las habitaciones, su capacidad, precio, características, servicios y promociones. Una presentación desorganizada o la ausencia de filtros puede dificultar la comparación y la navegación.

El proyecto aborda esta necesidad mediante una aplicación de demostración que:

- Presenta la propuesta del hotel y orienta a la persona usuaria hacia las secciones principales.
- Expone un catálogo consultable de habitaciones con búsqueda, filtros, ordenamiento y paginación.
- Permite ver información ampliada de cada habitación.
- Organiza servicios y promociones en páginas propias.
- Ofrece una selección temporal de habitaciones y una simulación de solicitud de reserva.
- Obtiene el contenido dinámico desde una API REST desplegada.

La solución no pretende confirmar disponibilidad real ni reemplazar un sistema de reservas. Los datos describen una oferta ficticia y los pasos finales del flujo son una simulación local en el navegador.

### 2.1 Justificación

El proyecto permite aplicar de manera integrada conceptos de desarrollo web del lado del cliente y del servidor. La separación entre la API y la interfaz facilita comprender el intercambio de información mediante HTTP y JSON, mientras que el catálogo hotelero ofrece un contexto concreto para relacionar productos, categorías, servicios y promociones. La construcción con Docker y la configuración para desplegar en Render y Vercel documentan el ciclo técnico desde el desarrollo local hasta la publicación prevista de la aplicación.

### 2.2 Análisis de usuarios

Se identifican dos perfiles principales de uso: la persona que compara opciones para una estadía individual o en pareja y la persona que organiza un viaje para varias personas. Los siguientes **perfiles User Persona son hipotéticos** y se construyeron a partir de las funcionalidades y del contexto del proyecto; no representan entrevistas ni resultados de investigación de campo.

#### User Persona 1: viajera que compara habitaciones

| Aspecto | Descripción |
|---|---|
| ¿Quién es? | Andrea, persona adulta que planea una visita corta a Huancayo y consulta alternativas de alojamiento desde su celular o computadora. |
| ¿Qué necesita? | Comparar habitaciones por precio, capacidad, categoría y características antes de decidir cuál se ajusta a su viaje. |
| ¿Qué problema presenta? | La información dispersa o sin filtros le obliga a revisar muchas opciones y dificulta encontrar rápidamente una habitación dentro de su presupuesto. |
| ¿Qué información consulta? | Precio por noche, descripción, capacidad, categoría, tipo de cama, dimensiones, características y promociones aplicables. |
| ¿Qué acciones realizará dentro de la aplicación? | Explora la portada, busca y filtra el catálogo, ordena resultados, abre el detalle de una habitación, consulta promociones y añade una opción a su selección temporal. |

**Necesidad principal:** encontrar y comparar opciones de alojamiento con información visible y organizada, sin tener que revisar cada habitación manualmente.

#### User Persona 2: organizador de viaje familiar

| Aspecto | Descripción |
|---|---|
| ¿Quién es? | Carlos, persona adulta que organiza una salida familiar a Huancayo y debe considerar la capacidad del alojamiento y los servicios que podrían necesitar. |
| ¿Qué necesita? | Identificar habitaciones adecuadas para varias personas, entender qué servicios se incluyen y revisar ofertas relacionadas con habitaciones familiares. |
| ¿Qué problema presenta? | Una habitación puede parecer apropiada por su precio, pero no tener capacidad suficiente; además, no siempre es claro qué servicios están incluidos y cuáles se solicitan aparte. |
| ¿Qué información consulta? | Capacidad máxima, precio por noche, características, servicios incluidos o a solicitud, promociones y estimado para las fechas seleccionadas. |
| ¿Qué acciones realizará dentro de la aplicación? | Filtra por número de huéspedes, compara detalles, revisa servicios y promociones, añade una o más opciones a la selección y completa el formulario de simulación para revisar el estimado. |

**Necesidad principal:** evaluar opciones y servicios considerando las necesidades del grupo, con una estimación orientativa antes de contactar o tomar una decisión.

Ambos perfiles utilizan la aplicación sin crear una cuenta. El prototipo no realiza una reserva real ni verifica disponibilidad; por tanto, las personas descritas representan necesidades de consulta y planificación, no usuarios autenticados ni clientes existentes del hotel.

### 2.3 Propuesta de valor

#### Empresa seleccionada

La propuesta se contextualiza en **Hotel Incontrastable**, un hotel ficticio ubicado en Huancayo, Junín, Perú. El catálogo representa habitaciones como el recurso principal de productos y utiliza precios demostrativos expresados en soles peruanos.

#### Problema que busca resolver

La aplicación busca reducir la dificultad de encontrar y comparar la información de alojamiento cuando los datos de habitaciones, capacidades, servicios y promociones no se presentan de forma unificada. Proporciona una experiencia de consulta organizada y accesible desde una interfaz web multipágina.

#### Usuarios a quienes se dirige

Se dirige principalmente a personas que planean una estadía individual o en pareja y a personas que organizan un viaje para un grupo o familia. Sus necesidades se describen en los dos User Persona de la sección anterior.

#### Información que necesitan

- Habitaciones disponibles en el catálogo demostrativo, con nombre y descripción.
- Precio por noche, capacidad, categoría, tipo de cama, dimensiones y características.
- Servicios del hotel, indicando cuáles se muestran como incluidos y cuáles se ofrecen a solicitud.
- Promociones activas, porcentaje de descuento, código e identificación de las habitaciones asociadas.
- Información suficiente para comparar y preparar un estimado local basado en fechas y selección.

El término “disponibles” en esta demostración se refiere a los registros que devuelve el catálogo; no equivale a disponibilidad hotelera en tiempo real.

#### Funcionalidades que proporciona

La solución presenta una portada, catálogo con búsqueda, filtros, ordenamiento y paginación, consulta de detalle, páginas de servicios y promociones, selección temporal de habitaciones y formulario de simulación de reserva. También comunica estados de carga, error o falta de coincidencias cuando corresponda.

#### Recursos de la API utilizados

El frontend consume `Productos` (`/api/productos` y `/api/productos/{id}`), `Categorías` (`/api/categorias`), `Servicios` (`/api/servicios`) y `Promociones` (`/api/promociones`). El endpoint `/api/salud` se utiliza para comprobar el estado del servicio desplegado.

#### Diferenciación frente a una consulta básica

La propuesta va más allá de mostrar una lista estática: permite combinar búsqueda y criterios de comparación, consultar atributos ampliados, vincular descuentos a habitaciones específicas y conservar una selección durante la navegación dentro de la pestaña. Además, la información principal se obtiene dinámicamente por HTTP desde la API; la interfaz calcula una estimación de la estadía sin presentar ese cálculo como reserva confirmada. La identidad visual está contextualizada en Huancayo y organiza el recorrido en páginas dedicadas.

## 3. Objetivos

### 3.1 Objetivo general

Desarrollar y desplegar una aplicación web multipágina para el Hotel Incontrastable que consuma una API REST propia y permita explorar habitaciones, servicios y promociones mediante una interfaz adaptable a distintos tamaños de pantalla.

### 3.2 Objetivos específicos

1. Diseñar una API REST que exponga habitaciones como recurso principal y recursos relacionados con la actividad hotelera.
2. Implementar búsqueda, filtros, ordenamiento, paginación y consulta individual de habitaciones.
3. Construir páginas independientes para la portada, habitaciones, servicios y promociones.
4. Presentar estados de carga, error y ausencia de resultados en las vistas que consumen datos.
5. Implementar una selección temporal y un flujo de reserva demostrativo sin efectuar cobros ni almacenar solicitudes.
6. Desplegar la API como servicio Docker en Render y el frontend estático en Vercel.
7. Verificar la construcción de ambos componentes y comprobar por HTTP las páginas y los endpoints en sus respectivos servicios.

## 4. Alcance y delimitaciones

### 4.1 Funcionalidades incluidas

- Sitio multipágina con portada, catálogo de habitaciones, servicios y promociones.
- API propia con endpoints para habitaciones, categorías, servicios, promociones y estado del servicio.
- Búsqueda textual y filtros por categoría y capacidad; ordenamiento por precio o capacidad.
- Paginación del catálogo.
- Consulta de detalle de una habitación.
- Selección temporal de habitaciones en el navegador.
- Formulario con fechas, número de huéspedes, nombre y correo para una simulación de reserva.
- Estados visuales de carga, error de conexión y catálogo sin resultados.
- Despliegue separado: API Docker en Render y frontend estático en Vercel.

### 4.2 Fuera del alcance

- Registro, autenticación y gestión de cuentas de usuario.
- Base de datos y persistencia de habitaciones, promociones o reservas.
- Validación de disponibilidad hotelera en tiempo real.
- Confirmación de una reserva real, notificaciones o atención al cliente.
- Procesamiento de pagos.
- Panel administrativo para editar el catálogo.
- Video de presentación, que se realizará en una etapa posterior y no forma parte de este informe.

La ausencia de base de datos y de autenticación es intencional para esta demostración. Una solicitud completada en el navegador genera una confirmación de ejemplo y no se transmite ni se conserva como una reserva real.

## 5. Requisitos y correspondencia con la solución

| Requisito de la consigna | Implementación | Comprobación |
|---|---|---|
| Elegir una empresa como contexto | Hotel Incontrastable, hotel ficticio de Huancayo | Nombre y contexto en las cuatro páginas |
| Desarrollar una API propia y publicarla en Render | API ASP.NET Core en un servicio Docker independiente | Endpoints accesibles bajo la URL de Render |
| Incluir un recurso principal de productos | Habitaciones representadas como productos | `GET /api/productos` y `GET /api/productos/{id}` |
| Incorporar al menos tres recursos relacionados | Categorías, servicios y promociones | Endpoints `GET /api/categorias`, `/api/servicios` y `/api/promociones` |
| Analizar al menos dos tipos de usuario e incluir User Persona | Viajera que compara habitaciones y organizador de viaje familiar | Perfiles con necesidades, problemas, información y acciones en la sección 2.2 |
| Formular una propuesta de valor | Define contexto, problema, usuarios, información, funcionalidades, recursos y diferenciación | Sección 2.3 |
| Crear una aplicación web responsive que consuma la API | Frontend multipágina que consulta recursos de la API | Catálogo, página de servicios y página de promociones |
| Incluir búsqueda y filtros | Búsqueda textual, categoría, huéspedes y orden | Controles de la página de habitaciones |
| Mostrar detalle del producto | Diálogo con atributos de la habitación | Acción de detalle en las tarjetas del catálogo |
| Incluir carrito o selección | Panel lateral de selección temporal | Añadir, quitar y conservar durante la pestaña |
| Gestionar carga, error y ausencia de resultados | Estados visuales específicos en el catálogo y errores de recursos | Mensajes y controles de reintento en la interfaz |
| Presentar evidencias del funcionamiento | Espacios marcados para capturas en la sección 12 | Completar las capturas antes de entregar el informe |
| Realizar exposición audiovisual | No se desarrolla en este documento | Se deja expresamente para la etapa final |

## 6. Metodología de trabajo

El desarrollo se realizó de forma incremental, estableciendo primero el alcance funcional y luego construyendo y verificando las capas de la solución. El proceso puede resumirse en las siguientes etapas:

1. **Análisis de la consigna:** identificación de la necesidad de una empresa contextualizada, una API propia, recursos relacionados y una interfaz consumidora.
2. **Definición del dominio:** elección de un hotel en Huancayo y representación de sus habitaciones como productos, junto con categorías, servicios y promociones.
3. **Diseño de la API:** definición de modelos, rutas, parámetros de consulta y respuestas de error.
4. **Construcción del frontend:** desarrollo de las páginas y conexión a los endpoints para presentar datos dinámicos.
5. **Integración:** configuración del frontend para consumir la API mediante `API_BASE_URL` y configuración de CORS para permitir los orígenes del frontend.
6. **Verificación:** compilación de la API y del frontend por separado, más comprobaciones HTTP locales; la validación del despliegue separado queda pendiente de ejecutarlo en Vercel y actualizar la API en Render.
7. **Despliegue:** publicación de la API mediante Docker en Render y publicación del frontend estático en Vercel.

El alcance priorizó cumplir los requisitos funcionales del prototipo con datos de ejemplo, evitando incorporar una base de datos o sistemas de autenticación que no eran necesarios para la demostración.

## 7. Diseño de la solución

### 7.1 Arquitectura general

La solución utiliza una arquitectura cliente-servidor con despliegue en dos servicios. Vercel entrega las páginas estáticas y los recursos del frontend. El JavaScript del navegador realiza solicitudes HTTPS a la API ASP.NET Core, que se ejecuta como servicio Docker independiente en Render. Como ambos servicios tienen orígenes distintos, la API permite mediante CORS solo los dominios indicados en `FRONTEND_ORIGINS`.

```text
Persona usuaria
      │
      ▼
Frontend estático en Vercel
 ├─ HTML: portada, habitaciones, servicios y promociones
 ├─ CSS: Bootstrap 5.3 y estilos propios
 └─ JavaScript: interacción, estado temporal y solicitudes HTTP
      │
      │ HTTPS + CORS
      │ GET /api/...
      ▼
API en Render
 └─ Contenedor Docker
     └─ Aplicación ASP.NET Core (.NET 10)
         ├─ Controladores REST
         └─ HotelCatalog (datos de ejemplo en memoria)
```

### 7.2 Tecnologías

| Componente | Tecnología | Uso |
|---|---|---|
| Backend | ASP.NET Core, .NET 10 | API REST, controladores y servicio de catálogo |
| Frontend | HTML5, CSS y JavaScript | Páginas, diseño responsive e interacción |
| Estilos y componentes | Bootstrap 5.3.3 más CSS propio | Base visual y adaptación de la interfaz |
| Construcción del frontend | Node.js | Copia de páginas y recursos a `frontend/dist` |
| Contenedorización | Docker | Publicación de la API en una imagen .NET |
| Alojamiento de la API | Render | Servicio web Docker |
| Alojamiento del frontend | Vercel | Sitio estático construido desde `frontend/` |
| Almacenamiento de datos | Memoria del proceso | Datos de ejemplo; no constituye almacenamiento persistente |

Las páginas cargan Bootstrap CSS desde su CDN y utilizan fuentes web externas. El comportamiento del menú móvil se gestiona con JavaScript propio; la aplicación no requiere el bundle JavaScript de Bootstrap para esa interacción.

## 8. Modelo de información

El conjunto demostrativo contiene ocho habitaciones, cuatro categorías, seis servicios y tres promociones activas.

### 8.1 Entidades principales

| Entidad | Atributos representativos | Relación o función |
|---|---|---|
| Producto (habitación) | Identificador, nombre, descripción, precio por noche, capacidad, metros cuadrados, tipo de cama, categoría, características, imagen y destacado | Pertenece a una categoría y puede estar asociado a promociones |
| Categoría | Identificador, nombre y descripción | Agrupa productos |
| Servicio del hotel | Identificador, nombre, descripción, icono e indicador de si está incluido | Se presenta en la página de servicios |
| Promoción | Identificador, nombre, descripción, código, porcentaje e identificadores de productos aplicables | Puede asociarse a varias habitaciones |
| Resultado paginado | Elementos, total, página, tamaño y total de páginas | Envuelve las respuestas del listado de productos |

### 8.2 Relaciones

- Cada producto tiene un `categoriaId` que permite identificar su categoría.
- Cada promoción contiene una lista `productosIds` con las habitaciones a las que aplica.
- Los servicios se publican como un catálogo informativo independiente.
- El carrito es estado del cliente, almacenado en `sessionStorage` durante la pestaña del navegador; no es una entidad persistida en el servidor.

### 8.3 Datos ilustrativos

Los precios se expresan en soles peruanos (PEN). Por ejemplo, el catálogo incluye habitaciones con precios de demostración desde S/ 149 por noche y capacidades de entre dos y cuatro huéspedes, según el producto. Los descuentos se calculan para las habitaciones relacionadas con cada promoción.

Los datos son estáticos y se inicializan cuando se inicia la aplicación. Un reinicio del proceso vuelve a cargar el mismo conjunto de ejemplo; no hay operaciones de alta, modificación o eliminación expuestas para el catálogo.

## 9. API REST

La API está organizada mediante controladores ASP.NET Core y un servicio `IHotelCatalog`. El servicio `HotelCatalog` entrega los datos de ejemplo y realiza el filtrado, ordenamiento y paginación del catálogo.

### 9.1 Endpoints

| Método | Ruta | Descripción | Respuesta prevista |
|---|---|---|---|
| GET | `/api/productos` | Lista habitaciones con búsqueda, filtros, orden y paginación | `200 OK` con elementos y metadatos |
| GET | `/api/productos/{id}` | Devuelve una habitación por identificador | `200 OK`, `400 Bad Request` para ID no positivo, `404 Not Found` si no existe |
| GET | `/api/categorias` | Lista categorías disponibles | `200 OK` |
| GET | `/api/categorias/{id}` | Consulta una categoría | `200 OK` o `404 Not Found` |
| GET | `/api/servicios` | Lista servicios del hotel | `200 OK` |
| GET | `/api/promociones` | Lista promociones activas | `200 OK` |
| GET | `/api/promociones?productoId={id}` | Lista promociones activas relacionadas con una habitación | `200 OK`, `400 Bad Request` si el ID no es positivo, `404 Not Found` si el producto no existe |
| GET | `/api/salud` | Informa el estado de disponibilidad de la API | `200 OK` |

### 9.2 Parámetros del catálogo

| Parámetro | Tipo | Función |
|---|---|---|
| `q` | Texto | Busca coincidencias en el nombre y la descripción |
| `categoriaId` | Entero | Filtra por categoría existente |
| `huespedes` | Entero | Filtra habitaciones cuya capacidad sea igual o superior |
| `precioMin` | Decimal | Establece el precio mínimo por noche |
| `precioMax` | Decimal | Establece el precio máximo por noche |
| `orden` | Texto | Acepta `precio-asc`, `precio-desc` o `capacidad-desc` |
| `pagina` | Entero | Número de página; el valor por defecto es 1 |
| `tamanoPagina` | Entero | Elementos por página; por defecto 8 y máximo permitido 24 |

El controlador valida rangos, identificadores, la existencia de categorías, el orden solicitado y los valores de paginación antes de delegar la búsqueda al servicio. Los parámetros incompatibles o fuera de rango generan `400 Bad Request`.

### 9.3 Ejemplo de consulta

```http
GET /api/productos?q=suite&huespedes=2&orden=precio-asc&pagina=1&tamanoPagina=6
Accept: application/json
```

La respuesta de listado sigue el modelo paginado. ASP.NET Core serializa los nombres de propiedades en camelCase:

```json
{
  "items": [
    {
      "id": 3,
      "nombre": "Suite Huaytapallana",
      "precioPorNoche": 329,
      "capacidad": 2,
      "categoriaId": 3
    }
  ],
  "total": 1,
  "pagina": 1,
  "tamanoPagina": 6,
  "totalPaginas": 1
}
```

El ejemplo es ilustrativo y se limita a campos representativos; la respuesta real del producto incluye también su descripción, dimensiones, tipo de cama, características, URL de imagen e indicador destacado.

## 10. Interfaz y funcionamiento

### 10.1 Portada

La portada presenta la identidad del hotel, su ubicación en Huancayo y enlaces hacia el catálogo, los servicios y las promociones. También incorpora llamadas a la acción para orientar la navegación.

### 10.1.1 Adaptación responsive

La interfaz utiliza una estructura fluida y reglas CSS por puntos de quiebre para reorganizar sus componentes según el ancho disponible. En pantallas grandes se muestran en varias columnas el hero, las tarjetas y los bloques de contenido. En anchos de hasta 991.98 px se reorganizan la navegación, los filtros y las grillas; hasta 767.98 px el hero pasa a una disposición vertical, las secciones ajustan espaciados y el catálogo y los servicios reducen sus columnas; hasta 480 px las tarjetas del catálogo y los servicios pasan a una columna y los campos de fechas del formulario también se apilan.

Estas reglas buscan conservar legibilidad y navegación en computadora, tablet y celular. La existencia de media queries confirma que el diseño contempla distintos anchos; se recomienda realizar y documentar una revisión visual final en esos tres tamaños antes de entregar.

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura de la portada desplegada en Render, incluyendo encabezado, propuesta visual y enlaces a las secciones).

### 10.2 Página de habitaciones

El catálogo consulta `/api/productos` y carga las categorías desde `/api/categorias`. Cada tarjeta presenta nombre, categoría, capacidad, características principales, precio por noche y, cuando corresponde, el descuento aplicable. El usuario puede:

- Buscar por texto en el nombre o la descripción.
- Filtrar por categoría y capacidad de huéspedes.
- Ordenar por precio ascendente, precio descendente o capacidad.
- Navegar entre páginas de resultados.
- Abrir el detalle de una habitación.
- Añadir o quitar habitaciones de su selección.
- Limpiar filtros o volver a intentar la consulta ante un error.

La página informa el estado de carga y muestra un mensaje cuando no hay resultados o cuando falla la comunicación con la API.

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura del catálogo desplegado con las habitaciones cargadas, controles de búsqueda y filtros visibles).

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura del detalle de una habitación con capacidad, características, precio y promoción, si corresponde).

### 10.3 Página de servicios

La página consulta `/api/servicios` y presenta seis servicios. Cada ficha identifica su nombre y descripción, e indica si está incluido o si se ofrece a solicitud. La vista diferencia informativamente elementos como Wi-Fi y recepción de servicios sujetos a coordinación.

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura de la página de servicios donde se vean los servicios incluidos y los disponibles a solicitud).

### 10.4 Página de promociones

La página consulta `/api/promociones` y muestra tres promociones de demostración. Cada promoción presenta porcentaje de descuento, descripción y código. El control de copia intenta copiar el código al portapapeles; si el navegador no concede ese permiso, informa al usuario del código. En esta versión el código se presenta con fines informativos: no existe un campo para ingresarlo o validarlo. El descuento mostrado se determina automáticamente por la relación entre la promoción activa y los identificadores de las habitaciones a las que aplica.

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura de las tres promociones y sus códigos en la página publicada).

### 10.5 Selección y reserva demostrativa

El panel de selección permite añadir y quitar habitaciones. El estado se conserva con `sessionStorage`, por lo que permanece disponible al cambiar entre páginas dentro de la misma pestaña, pero no constituye persistencia de servidor.

Al continuar, el formulario solicita:

- Fecha de llegada y fecha de salida.
- Número de huéspedes, limitado por la capacidad total de las habitaciones seleccionadas.
- Nombre de contacto.
- Correo electrónico.

La interfaz valida que la fecha de salida sea posterior a la de llegada, que la cantidad de huéspedes esté dentro de la capacidad y que los datos de contacto sean válidos. A continuación calcula un estimado con el precio por noche, las promociones aplicables y el número de noches. La confirmación generada es únicamente demostrativa; no se guarda en el backend, no reserva inventario y no procesa ningún pago.

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura del panel de selección con una o más habitaciones añadidas).

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura del formulario de simulación completado, ocultando cualquier dato personal real).

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura de la confirmación demo y del aviso de que no se creó una reserva real).

## 11. Implementación técnica

### 11.1 Registro de servicios y configuración CORS

ASP.NET Core registra los controladores y el catálogo como servicio singleton. Como el frontend se sirve desde Vercel y la API desde Render, se configura una lista explícita de orígenes permitidos mediante la variable `FRONTEND_ORIGINS`. Si esta variable no está definida, se autorizan únicamente los orígenes locales de desarrollo.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<IHotelCatalog, HotelCatalog>();
var frontendOrigins = builder.Configuration["FRONTEND_ORIGINS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(frontendOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});
```

La política se aplica antes de mapear los controladores. En producción, Render debe tener configurado el dominio HTTPS exacto de Vercel; la API no acepta cualquier origen de manera indiscriminada.

### 11.2 Acceso al catálogo desde el frontend

El frontend consume JSON mediante `fetch`. Durante el build, `frontend/scripts/build.mjs` genera `config.js` con el valor de `API_BASE_URL`; para Vercel se requiere una URL absoluta HTTPS de la API. En desarrollo local, si no se especifica la variable, se usa `http://localhost:5050`.

```javascript
async function requestJson(path) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" }
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body?.detail || body?.error || `La solicitud falló (HTTP ${response.status}).`
    );
  }

  return body;
}
```

La implementación completa también distingue fallos de conexión y respuestas que no contienen JSON válido, para mostrarlos mediante estados de error comprensibles.

### 11.3 Cálculo del precio promocional

El frontend relaciona promociones activas con los identificadores de producto. Si existe más de una promoción aplicable, utiliza la de mayor porcentaje para calcular el precio mostrado.

```javascript
function getRoomPrice(product) {
  const offer = getRoomOffers(product.id)
    .sort((first, second) =>
      second.porcentajeDescuento - first.porcentajeDescuento
    )[0];

  return {
    offer,
    price: offer
      ? product.precioPorNoche * (1 - offer.porcentajeDescuento / 100)
      : product.precioPorNoche
  };
}
```

El precio resultante se utiliza en las tarjetas, el detalle, la selección y el estimado de la simulación. No representa un cargo ni un precio confirmado por un sistema transaccional.

### 11.4 Construcción Docker de la API

El Dockerfile se limita al backend. Utiliza el SDK .NET para restaurar y publicar la API, y una imagen de runtime ASP.NET Core más pequeña para ejecutarla. El frontend no se copia al contenedor: Vercel lo construye y aloja por separado.

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/HotelIncontrastable.Api/HotelIncontrastable.Api.csproj \
    backend/HotelIncontrastable.Api/
RUN dotnet restore backend/HotelIncontrastable.Api/HotelIncontrastable.Api.csproj
COPY backend/HotelIncontrastable.Api/ backend/HotelIncontrastable.Api/
RUN dotnet publish backend/HotelIncontrastable.Api/HotelIncontrastable.Api.csproj \
    -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HotelIncontrastable.Api.dll"]
```

La imagen final contiene la API publicada y el runtime ASP.NET Core; no contiene ni sirve las páginas del frontend.

### 11.5 Configuración en Render y Vercel

El archivo `render.yaml` define únicamente el servicio web Docker de la API. Usa el Dockerfile de la raíz, el contexto raíz del repositorio y `/api/salud` como ruta de verificación. La aplicación escucha en el puerto 8080, configurado mediante `ASPNETCORE_URLS`.

En Vercel, el proyecto se configura con `frontend/` como directorio raíz, `npm run build` como comando de construcción y `dist` como directorio de salida. La variable de entorno `API_BASE_URL` debe contener la URL HTTPS pública del servicio Render. El script de construcción genera `config.js` con ese valor y falla si Vercel no tiene una URL absoluta HTTPS configurada.

Después del primer despliegue de Vercel, el dominio público del frontend debe añadirse a la variable `FRONTEND_ORIGINS` del servicio Render. Esta variable acepta una lista de orígenes separados por comas y no debe incluir rutas ni barras finales. Si no se configura, la API permite únicamente los orígenes locales de desarrollo; por lo tanto, el navegador bloqueará las solicitudes desde Vercel hasta configurar el dominio.

La URL de la API desplegada es:

<https://ev-parcial-hotel-incontrastable-oscategui.onrender.com/>

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura del panel de Render mostrando el servicio activo y el despliegue exitoso; ocultar identificadores o información privada que no sea necesaria).

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura del proyecto desplegado en Vercel con el frontend visible y la barra de direcciones).

## 12. Verificación y resultados

La verificación combinó compilación local, comprobaciones HTTP de la publicación de .NET y revisión del servicio desplegado en el navegador. Las pruebas aquí consignadas son verificaciones funcionales/manuales; el proyecto no incluye una suite automatizada de pruebas unitarias o de integración.

### 12.1 Comprobaciones locales

La verificación local de esta revisión se realizó sobre los dos componentes por separado:

| Comprobación | Resultado |
|---|---|
| Compilación API con `dotnet build ... --configuration Release` | Correcta; 0 advertencias y 0 errores |
| Build del frontend en modo local | Correcto; `config.js` conserva `http://localhost:5050` como valor de desarrollo |
| Build simulado de Vercel sin `API_BASE_URL` | Falla explícitamente, como se espera |
| Build de Vercel con `API_BASE_URL` HTTPS de Render | Correcto; el archivo generado utiliza la URL configurada |
| Build Docker | Pendiente de validación en el entorno de despliegue |

Las verificaciones HTTP del antiguo despliegue integrado corresponden a una versión anterior de la arquitectura; no se consideran prueba del despliegue separado descrito en esta revisión.

### 12.2 Comprobaciones en el despliegue

El usuario debe aplicar la nueva configuración antes de validar este despliegue: importar `frontend/` como proyecto Vercel, definir `API_BASE_URL` con la dirección HTTPS de Render y añadir el dominio de producción que Vercel asigne a `FRONTEND_ORIGINS` en Render. Hasta completar ambas publicaciones, el despliegue independiente y la comunicación cross-origin quedan pendientes.

| Comprobación observable pendiente | Resultado actual |
|---|---|
| URL del frontend en Vercel | Pendiente: se asigna al crear el proyecto |
| Carga directa de portada y páginas internas desde Vercel | Pendiente de despliegue |
| Respuestas de la API desde el dominio Vercel | Pendiente de configurar `FRONTEND_ORIGINS` y probar CORS |
| Endpoints de la API tras publicar la versión API-only en Render | Pendiente de actualizar el servicio |

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura de `/habitaciones.html` desde el dominio Vercel ya desplegado con el catálogo cargado).

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura de la respuesta JSON de `/api/categorias` en Render y otra evidencia que confirme el consumo desde el frontend Vercel).

### 12.3 Pruebas funcionales recomendadas para completar la evidencia

Antes de entregar, conviene registrar capturas de las siguientes interacciones:

1. Buscar una habitación por una palabra incluida en su nombre y comprobar el resultado.
2. Aplicar un filtro de categoría y otro de capacidad.
3. Cambiar el orden de precios y avanzar de página cuando corresponda.
4. Abrir el detalle de una habitación y regresar al catálogo.
5. Añadir una habitación, navegar a otra página y confirmar que la selección sigue visible en la misma pestaña.
6. Eliminar una habitación de la selección.
7. Completar la simulación con datos ficticios y comprobar que se muestre el aviso de que no existe una reserva real.
8. Probar una búsqueda sin coincidencias y capturar el estado vacío.

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura de un filtro aplicado o de una búsqueda con sus resultados).

**Evidencia sugerida:** (PLACEHOLDER de imagen: captura del estado vacío tras una búsqueda sin coincidencias).

Las imágenes de evidencia deben corresponder al despliegue real, mostrar suficiente contexto para identificar la página y evitar exponer datos personales. No se deben presentar capturas de pruebas no realizadas como si fueran resultados observados.

## 13. Resultados

La implementación prepara una arquitectura de dos servicios: frontend estático en Vercel y API en Render. El código configura la URL de la API durante el build del frontend y limita CORS a los orígenes autorizados. La API compila correctamente y el build frontend local y el build simulado de Vercel fueron validados.

El despliegue independiente todavía no está verificado. El último despliegue confirmado por el usuario corresponde a la versión anterior, en la que el frontend y la API se servían desde Render. Para comprobar los resultados de esta nueva arquitectura se requiere publicar los cambios, configurar el dominio Vercel en Render y realizar las pruebas funcionales indicadas.

El alcance final es adecuado para una demostración académica de consumo de API y presentación de información. No es un sistema hotelero productivo: no controla disponibilidad, no registra reservas y no procesa pagos.

## 14. Limitaciones y consideraciones

1. **Datos no persistentes:** el catálogo está codificado en memoria; los cambios no se guardan y no hay base de datos.
2. **Reserva ficticia:** la confirmación se genera en el navegador. No se verifica inventario ni se crea una reserva en el servidor.
3. **Sin autenticación:** no hay usuarios, inicio de sesión ni autorización. No se requiere una cuenta para consultar la demostración.
4. **Sin pagos:** los valores y descuentos son informativos y no inician una transacción.
5. **Dependencias externas de presentación:** Bootstrap CSS, tipografías e imágenes remotas dependen de servicios externos. Existe una imagen SVG local de fallback para las imágenes de habitaciones.
6. **CORS y configuración del dominio:** la API permite los orígenes definidos en `FRONTEND_ORIGINS`; si se despliega en Vercel y no se añade el dominio, el navegador bloqueará las solicitudes. La configuración actual permite cualquier encabezado y método únicamente desde esos orígenes autorizados.
7. **Sin suite automatizada:** las verificaciones descritas son compilaciones y pruebas manuales/HTTP; no se reportan coberturas ni resultados de pruebas automatizadas.
8. **Alcance comercial limitado:** antes de operar como hotel real sería necesario implementar persistencia, validaciones del lado servidor, disponibilidad, manejo de datos personales, autenticación y procesos de reserva seguros.
9. **Códigos promocionales informativos:** el frontend muestra y permite copiar los códigos, pero no los recibe ni valida en el formulario de reserva. Los descuentos de demostración se aplican por la asociación predefinida entre promoción y habitación.

## 15. Conclusiones

El proyecto cumple el propósito de construir una aplicación web moderna que utiliza una API propia para presentar información relacionada con una empresa contextualizada. La solución incorpora un recurso principal de productos y varios recursos relacionados, además de una interfaz multipágina con búsqueda, filtros, detalle, selección y estados de interacción.

La arquitectura actual del código separa el frontend estático destinado a Vercel de la API ASP.NET Core destinada a Render. Esta separación requiere configurar correctamente `API_BASE_URL` en Vercel y `FRONTEND_ORIGINS` en Render. El despliegue de esta versión y la validación pública permanecen pendientes; por lo tanto, las verificaciones históricas de la versión integrada no se presentan como pruebas de la nueva publicación.

El prototipo demuestra una estructura comprensible y ampliable con ASP.NET Core, JavaScript y contenedores. Sus capacidades deben interpretarse dentro del alcance declarado: se trata de una demostración con datos estáticos y una reserva simulada, no de un sistema transaccional hotelero.

## 16. Recomendaciones de mejora

- Mantener este alcance demo claramente identificado en la interfaz y en futuras presentaciones.
- Si el proyecto evoluciona, mover los datos a una base de datos y separar configuración de secretos del código.
- Implementar creación de reservas en el backend, validación de disponibilidad y reglas de negocio centralizadas.
- Añadir autenticación y autorización solo si se requieren perfiles o funciones administrativas.
- Restringir CORS a los orígenes y métodos necesarios cuando corresponda.
- Incorporar pruebas automatizadas para controladores, filtros, ordenamiento, paginación y validaciones de reserva.
- Añadir monitoreo y registros que permitan diagnosticar errores del servicio desplegado.
- Revisar accesibilidad, navegación por teclado y contraste en pruebas dedicadas antes de considerar el producto listo para usuarios reales.

## 17. Referencias

1. Universidad Continental. *Evaluación parcial: Desarrollo de Aplicaciones Web — Consigna de evaluación*. Documento proporcionado para la asignatura, octubre de 2026.
2. Microsoft Learn. *ASP.NET Core Web API*. <https://learn.microsoft.com/aspnet/core/web-api/>
3. Microsoft Learn. *Static files in ASP.NET Core*. <https://learn.microsoft.com/aspnet/core/fundamentals/static-files>
4. Docker Docs. *Multi-stage builds*. <https://docs.docker.com/build/building/multi-stage/>
5. Render Docs. *Docker*. <https://docs.render.com/docker>
6. Bootstrap. *Documentation, version 5.3*. <https://getbootstrap.com/docs/5.3/>
7. MDN Web Docs. *Using the Fetch API*. <https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch>
8. MDN Web Docs. *Window: sessionStorage property*. <https://developer.mozilla.org/docs/Web/API/Window/sessionStorage>

## Anexo A. Estructura resumida del proyecto

```text
.
├── Dockerfile
├── render.yaml
├── README.md
├── backend/
│   └── HotelIncontrastable.Api/
│       ├── Controllers/
│       ├── Models/
│       ├── Services/
│       ├── Program.cs
│       └── HotelIncontrastable.Api.csproj
└── frontend/
    ├── assets/
    ├── scripts/
    ├── index.html
    ├── habitaciones.html
    ├── servicios.html
    ├── promociones.html
    ├── app.js
    ├── config.js
    └── styles.css
```

## Anexo B. Ejecución local

Requisitos: .NET 10 SDK y Node.js.

1. Desde la raíz del repositorio, iniciar la API:

   ```powershell
   dotnet run --project backend\HotelIncontrastable.Api --urls http://localhost:5050
   ```

2. En otra terminal, iniciar el servidor estático del frontend:

   ```powershell
   Set-Location frontend
   npm run dev
   ```

3. Abrir <http://localhost:5173/>.

En este modo, `frontend/config.js` apunta a `http://localhost:5050`. Para el build de Vercel, configura `API_BASE_URL` con la URL HTTPS de la API en Render; el proceso genera `config.js` con esa dirección y rechaza una configuración ausente o inválida.

## Anexo C. Rutas útiles para revisión

```text
/
/habitaciones.html
/servicios.html
/promociones.html
/api/salud
/api/productos
/api/categorias
/api/servicios
/api/promociones
```
