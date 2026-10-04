FROM node:22-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/package.json ./
COPY frontend/ ./
ENV API_BASE_URL=same-origin
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY backend/HotelIncontrastable.Api/HotelIncontrastable.Api.csproj backend/HotelIncontrastable.Api/
RUN dotnet restore backend/HotelIncontrastable.Api/HotelIncontrastable.Api.csproj
COPY backend/HotelIncontrastable.Api/ backend/HotelIncontrastable.Api/
RUN dotnet publish backend/HotelIncontrastable.Api/HotelIncontrastable.Api.csproj -c Release -o /app/publish /p:UseAppHost=false
COPY --from=frontend-build /src/frontend/dist/ /app/publish/wwwroot/

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "HotelIncontrastable.Api.dll"]
