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

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors("PublicDemo");
app.MapControllers();

app.Run();
