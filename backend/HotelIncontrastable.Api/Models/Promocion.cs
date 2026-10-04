namespace HotelIncontrastable.Api.Models;

public sealed record Promocion(
    int Id,
    string Nombre,
    string Descripcion,
    string Codigo,
    int PorcentajeDescuento,
    IReadOnlyList<int> ProductosIds,
    bool Activa);
