using HotelIncontrastable.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<IHotelCatalog, HotelCatalog>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("PublicDemo", policy =>
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("PublicDemo");
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    nombre = "Hotel Incontrastable — API de demostración",
    documentacion = "Consulta los endpoints /api/productos, /api/categorias, /api/servicios y /api/promociones.",
    salud = "/api/salud"
}));

app.Run();
