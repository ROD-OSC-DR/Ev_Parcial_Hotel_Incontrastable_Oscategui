using HotelIncontrastable.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<IHotelCatalog, HotelCatalog>();
var frontendOrigins = builder.Configuration["FRONTEND_ORIGINS"]?
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(frontendOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors("Frontend");
app.MapControllers();

app.Run();
