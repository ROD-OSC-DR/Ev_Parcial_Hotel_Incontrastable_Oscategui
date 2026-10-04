FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY HotelIncontrastable.Api/HotelIncontrastable.Api.csproj HotelIncontrastable.Api/
RUN dotnet restore HotelIncontrastable.Api/HotelIncontrastable.Api.csproj
COPY HotelIncontrastable.Api/ HotelIncontrastable.Api/
RUN dotnet publish HotelIncontrastable.Api/HotelIncontrastable.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HotelIncontrastable.Api.dll"]
