using HotelIncontrastable.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelIncontrastable.Api.Controllers;

[ApiController]
[Route("api/promociones")]
public sealed class PromocionesController(IHotelCatalog catalogo) : ControllerBase
{
    [HttpGet]
    public IActionResult Listar([FromQuery] int? productoId)
    {
        if (productoId is < 1)
        {
            return BadRequest(new { error = "El identificador del producto debe ser positivo." });
        }

        if (productoId is not null && catalogo.ObtenerProducto(productoId.Value) is null)
        {
            return NotFound(new { error = $"No se encontró la habitación con identificador {productoId}." });
        }

        return Ok(catalogo.ObtenerPromociones(productoId));
    }
}
