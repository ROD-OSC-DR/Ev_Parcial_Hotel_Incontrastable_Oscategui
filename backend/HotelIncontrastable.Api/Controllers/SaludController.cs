using Microsoft.AspNetCore.Mvc;

namespace HotelIncontrastable.Api.Controllers;

[ApiController]
[Route("api/salud")]
public sealed class SaludController : ControllerBase
{
    [HttpGet]
    public IActionResult Obtener() => Ok(new
    {
        estado = "disponible",
        servicio = "Hotel Incontrastable API",
        almacenamiento = "datos de ejemplo en memoria"
    });
}
