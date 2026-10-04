using HotelIncontrastable.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelIncontrastable.Api.Controllers;

[ApiController]
[Route("api/servicios")]
public sealed class ServiciosController(IHotelCatalog catalogo) : ControllerBase
{
    [HttpGet]
    public IActionResult Listar() => Ok(catalogo.ObtenerServicios());
}
