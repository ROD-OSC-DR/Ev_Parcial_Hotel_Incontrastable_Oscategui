using HotelIncontrastable.Api.Models;

namespace HotelIncontrastable.Api.Services;

public interface IHotelCatalog
{
    IReadOnlyList<Categoria> ObtenerCategorias();

    IReadOnlyList<ServicioHotel> ObtenerServicios();

    IReadOnlyList<Promocion> ObtenerPromociones(int? productoId = null);

    Producto? ObtenerProducto(int id);

    ResultadoPaginado<Producto> BuscarProductos(
        string? q,
        int? categoriaId,
        int? huespedes,
        decimal? precioMin,
        decimal? precioMax,
        string? orden,
        int pagina,
        int tamanoPagina);
}
