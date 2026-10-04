using HotelIncontrastable.Api.Models;

namespace HotelIncontrastable.Api.Services;

public sealed class HotelCatalog : IHotelCatalog
{
    private static readonly IReadOnlyList<Categoria> Categorias =
    [
        new(1, "Clásicas", "Comodidad esencial para una escapada tranquila."),
        new(2, "Superiores", "Más espacio y detalles para descansar mejor."),
        new(3, "Suites", "Ambientes amplios con una experiencia especial."),
        new(4, "Familiares", "Espacio pensado para viajar y compartir.")
    ];

    private static readonly IReadOnlyList<Producto> Productos =
    [
        new(1, "Habitación Andina", "Un refugio acogedor con detalles inspirados en la sierra central.", 149m, 2, 24, "1 cama doble", 1,
            ["Wi-Fi", "Baño privado", "Escritorio"], "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85", true),
        new(2, "Doble Mantaro", "Luz natural, tonos cálidos y una vista serena para dos.", 189m, 2, 28, "1 cama queen", 2,
            ["Wi-Fi", "Baño privado", "Desayuno incluido"], "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85", true),
        new(3, "Suite Huaytapallana", "Una suite amplia para disfrutar una estadía especial en Huancayo.", 329m, 2, 42, "1 cama king", 3,
            ["Wi-Fi", "Baño privado", "Sala de estar", "Desayuno incluido"], "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85", true),
        new(4, "Familiar Incontrastable", "Un ambiente cómodo para compartir el viaje en familia.", 349m, 4, 55, "1 cama queen y 2 camas individuales", 4,
            ["Wi-Fi", "Baño privado", "Minibar"], "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85", true),
        new(5, "Habitación Ejecutiva", "Un espacio funcional y silencioso para combinar trabajo y descanso.", 219m, 2, 32, "1 cama queen", 2,
            ["Wi-Fi", "Baño privado", "Escritorio", "Desayuno incluido"], "https://images.unsplash.com/photo-1590490359683-658d3d23f972?auto=format&fit=crop&w=1200&q=85", false),
        new(6, "Suite Valle del Mantaro", "Amplitud, confort y un rincón de descanso para una estadía relajada.", 389m, 3, 52, "1 cama king y 1 sofá cama", 3,
            ["Wi-Fi", "Baño privado", "Sala de estar", "Minibar"], "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=85", false),
        new(7, "Triple Confort", "Una alternativa práctica para viajar con amigos o en familia.", 259m, 3, 38, "3 camas individuales", 1,
            ["Wi-Fi", "Baño privado", "Escritorio"], "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85", false),
        new(8, "Doble Huanca", "Un espacio cálido con comodidades para recargar energías.", 199m, 2, 30, "2 camas individuales", 2,
            ["Wi-Fi", "Baño privado", "Desayuno incluido"], "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85", false)
    ];

    private static readonly IReadOnlyList<ServicioHotel> Servicios =
    [
        new(1, "Desayuno regional", "Empieza el día con una selección de sabores de la región.", "☕", false),
        new(2, "Wi-Fi de alta velocidad", "Conexión disponible en las habitaciones y áreas comunes.", "⌁", true),
        new(3, "Estacionamiento", "Espacio sujeto a disponibilidad durante tu estadía.", "⌖", false),
        new(4, "Recepción 24 horas", "Acompañamiento para consultas y orientación local.", "◷", true),
        new(5, "Traslado al centro", "Coordina un traslado de demostración al centro de Huancayo.", "↗", false),
        new(6, "Sala de reuniones", "Un espacio versátil para reuniones y encuentros.", "▦", false)
    ];

    private static readonly IReadOnlyList<Promocion> Promociones =
    [
        new(1, "Bienvenida Incontrastable", "Ahorra en una selección de habitaciones clásicas y superiores.", "HOLA15", 15, [1, 2, 5, 8], true),
        new(2, "Escapada entre montañas", "Un descuento especial para descansar en nuestras suites.", "SIERRA10", 10, [3, 6], true),
        new(3, "Viaje en familia", "Disfruta un precio especial en habitaciones para compartir.", "FAMILIA12", 12, [4, 7], true)
    ];

    public IReadOnlyList<Categoria> ObtenerCategorias() => Categorias;

    public IReadOnlyList<ServicioHotel> ObtenerServicios() => Servicios;

    public IReadOnlyList<Promocion> ObtenerPromociones(int? productoId = null)
    {
        var activas = Promociones.Where(promocion => promocion.Activa);
        if (productoId is not null)
        {
            activas = activas.Where(promocion => promocion.ProductosIds.Contains(productoId.Value));
        }

        return activas.ToArray();
    }

    public Producto? ObtenerProducto(int id) => Productos.FirstOrDefault(producto => producto.Id == id);

    public ResultadoPaginado<Producto> BuscarProductos(
        string? q,
        int? categoriaId,
        int? huespedes,
        decimal? precioMin,
        decimal? precioMax,
        string? orden,
        int pagina,
        int tamanoPagina)
    {
        IEnumerable<Producto> consulta = Productos;

        if (!string.IsNullOrWhiteSpace(q))
        {
            consulta = consulta.Where(producto =>
                producto.Nombre.Contains(q.Trim(), StringComparison.CurrentCultureIgnoreCase) ||
                producto.Descripcion.Contains(q.Trim(), StringComparison.CurrentCultureIgnoreCase));
        }

        if (categoriaId is not null)
        {
            consulta = consulta.Where(producto => producto.CategoriaId == categoriaId.Value);
        }

        if (huespedes is not null)
        {
            consulta = consulta.Where(producto => producto.Capacidad >= huespedes.Value);
        }

        if (precioMin is not null)
        {
            consulta = consulta.Where(producto => producto.PrecioPorNoche >= precioMin.Value);
        }

        if (precioMax is not null)
        {
            consulta = consulta.Where(producto => producto.PrecioPorNoche <= precioMax.Value);
        }

        consulta = orden?.ToLowerInvariant() switch
        {
            "precio-asc" => consulta.OrderBy(producto => producto.PrecioPorNoche),
            "precio-desc" => consulta.OrderByDescending(producto => producto.PrecioPorNoche),
            "capacidad-desc" => consulta.OrderByDescending(producto => producto.Capacidad),
            _ => consulta.OrderByDescending(producto => producto.Destacado).ThenBy(producto => producto.PrecioPorNoche)
        };

        var lista = consulta.ToArray();
        var items = lista
            .Skip((pagina - 1) * tamanoPagina)
            .Take(tamanoPagina)
            .ToArray();
        var totalPaginas = (int)Math.Ceiling(lista.Length / (double)tamanoPagina);

        return new ResultadoPaginado<Producto>(items, lista.Length, pagina, tamanoPagina, totalPaginas);
    }
}
