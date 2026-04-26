FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY DomainLayer/DomainLayer.csproj DomainLayer/
COPY SportMap.AL.Abstractions/SportMap.AL.Abstractions.csproj SportMap.AL.Abstractions/
COPY SportMap.AL/SportMap.AL.csproj SportMap.AL/
COPY SportMap.DAL.Abstractions/SportMap.DAL.Abstractions.csproj SportMap.DAL.Abstractions/
COPY SportMap.DAL/SportMap.DAL.csproj SportMap.DAL/
COPY SportMap.PL/SportMap.PL.csproj SportMap.PL/
RUN dotnet restore SportMap.PL/SportMap.PL.csproj

COPY DomainLayer/ DomainLayer/
COPY SportMap.AL.Abstractions/ SportMap.AL.Abstractions/
COPY SportMap.AL/ SportMap.AL/
COPY SportMap.DAL.Abstractions/ SportMap.DAL.Abstractions/
COPY SportMap.DAL/ SportMap.DAL/
COPY SportMap.PL/ SportMap.PL/

RUN dotnet publish SportMap.PL/SportMap.PL.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY SportMap.PL/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["dotnet", "SportMap.PL.dll"]
