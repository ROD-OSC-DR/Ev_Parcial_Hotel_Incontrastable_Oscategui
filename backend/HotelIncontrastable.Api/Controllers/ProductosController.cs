using HotelIncontrastable.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelIncontrastable.Api.Controllers;

[ApiController]
[Route("api/productos")]
public sealed class ProductosController(IHotelCatalog catalogo) : ControllerBase
{
    [HttpGet]
    public IActionResult Listar(
        [FromQuery] string? q,
        [FromQuery] int? categoriaId,
        [FromQuery] int? huespedes,
        [FromQuery] decimal? precioMin,
        [FromQuery] decimal? precioMax,
        [FromQuery] string? orden,
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanoPagina = 8)
    {
        if (categoriaId is < 1 ||
            (categoriaId is not null && !catalogo.ObtenerCategorias().Any(categoria => categoria.Id == categoriaId)) ||
            huespedes is < 1 ||
            precioMin is < 0 ||
            precioMax is < 0 ||
            (precioMin is not null && precioMax is not null && precioMin > precioMax) ||
            pagina < 1 ||
            tamanoPagina is < 1 or > 24 ||
            (orden is not null && orden is not ("precio-asc" or "precio-desc" or "capacidad-desc")))
        {
            return BadRequest(new
            {
                error = "Parámetros de búsqueda inválidos.",
                detalle = "Revisa categoría, capacidad, rango de precio, orden, página y tamaño de página."
            });
        }

        return Ok(catalogo.BuscarProductos(q, categoriaId, huespedes, precioMin, precioMax, orden, pagina, tamanoPagina));
    }

    [HttpGet("{id:int}")]
    public IActionResult Obtener(int id)
    {
        if (id < 1)
        {
            return BadRequest(new { error = "El identificador debe ser un entero positivo." });
        }

        var producto = catalogo.ObtenerProducto(id);
        return producto is null
            ? NotFound(new { error = $"No se encontró la habitación con identificador {id}." })
            : Ok(producto);
    }
}
