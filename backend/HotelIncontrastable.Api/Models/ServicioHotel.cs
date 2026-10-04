namespace HotelIncontrastable.Api.Models;

public sealed record ServicioHotel(
    int Id,
    string Nombre,
    string Descripcion,
    string Icono,
    bool Incluido);
