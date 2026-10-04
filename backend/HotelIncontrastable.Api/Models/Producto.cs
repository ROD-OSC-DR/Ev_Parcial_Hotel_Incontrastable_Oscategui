namespace HotelIncontrastable.Api.Models;

public sealed record Producto(
    int Id,
    string Nombre,
    string Descripcion,
    decimal PrecioPorNoche,
    int Capacidad,
    int MetrosCuadrados,
    string TipoCama,
    int CategoriaId,
    IReadOnlyList<string> Caracteristicas,
    string ImagenUrl,
    bool Destacado);
