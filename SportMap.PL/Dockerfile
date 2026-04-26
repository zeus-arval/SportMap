FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY DomainLayer/DomainLayer.csproj DomainLayer/
COPY SportMap.AL.Abstractions/SportMap.AL.Abstractions.csproj SportMap.AL.Abstractions/
COPY SportMap.AL/SportMap.AL.csproj SportMap.AL/
COPY SportMap.DAL.Abstractions/SportMap.DAL.Abstractions.csproj SportMap.DAL.Abstractions/
COPY SportMap.DAL/SportMap.DAL.csproj SportMap.DAL/
COPY SportMap.Server/SportMap.PL.csproj SportMap.Server/
RUN dotnet restore SportMap.Server/SportMap.PL.csproj

COPY DomainLayer/ DomainLayer/
COPY SportMap.AL.Abstractions/ SportMap.AL.Abstractions/
COPY SportMap.AL/ SportMap.AL/
COPY SportMap.DAL.Abstractions/ SportMap.DAL.Abstractions/
COPY SportMap.DAL/ SportMap.DAL/
COPY SportMap.Server/ SportMap.Server/

RUN dotnet publish SportMap.Server/SportMap.PL.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY SportMap.Server/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["dotnet", "SportMap.PL.dll"]
