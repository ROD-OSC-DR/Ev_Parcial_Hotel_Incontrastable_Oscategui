using HotelIncontrastable.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace HotelIncontrastable.Api.Controllers;

[ApiController]
[Route("api/categorias")]
public sealed class CategoriasController(IHotelCatalog catalogo) : ControllerBase
{
    [HttpGet]
    public IActionResult Listar() => Ok(catalogo.ObtenerCategorias());

    [HttpGet("{id:int}")]
    public IActionResult Obtener(int id)
    {
        var categoria = catalogo.ObtenerCategorias().FirstOrDefault(item => item.Id == id);
        return categoria is null
            ? NotFound(new { error = $"No se encontró la categoría con identificador {id}." })
            : Ok(categoria);
    }
}
