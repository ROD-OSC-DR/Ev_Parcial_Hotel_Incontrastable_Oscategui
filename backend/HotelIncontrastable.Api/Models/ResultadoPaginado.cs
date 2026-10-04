namespace HotelIncontrastable.Api.Models;

public sealed record ResultadoPaginado<T>(
    IReadOnlyList<T> Items,
    int Total,
    int Pagina,
    int TamanoPagina,
    int TotalPaginas);
