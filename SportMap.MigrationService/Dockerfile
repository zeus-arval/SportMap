FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY DomainLayer/DomainLayer.csproj DomainLayer/
COPY SportMap.AL.Abstractions/SportMap.AL.Abstractions.csproj SportMap.AL.Abstractions/
COPY SportMap.DAL.Abstractions/SportMap.DAL.Abstractions.csproj SportMap.DAL.Abstractions/
COPY SportMap.DAL/SportMap.DAL.csproj SportMap.DAL/
COPY SportMap.ServiceDefaults/SportMap.ServiceDefaults.csproj SportMap.ServiceDefaults/
COPY SportMap.MigrationService/SportMap.MigrationService.csproj SportMap.MigrationService/
RUN dotnet restore SportMap.MigrationService/SportMap.MigrationService.csproj

COPY DomainLayer/ DomainLayer/
COPY SportMap.AL.Abstractions/ SportMap.AL.Abstractions/
COPY SportMap.DAL.Abstractions/ SportMap.DAL.Abstractions/
COPY SportMap.DAL/ SportMap.DAL/
COPY SportMap.ServiceDefaults/ SportMap.ServiceDefaults/
COPY SportMap.MigrationService/ SportMap.MigrationService/

RUN dotnet publish SportMap.MigrationService/SportMap.MigrationService.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY SportMap.MigrationService/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["dotnet", "SportMap.MigrationService.dll"]
