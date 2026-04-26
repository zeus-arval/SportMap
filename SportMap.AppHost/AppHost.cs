var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("compose");

var cache = builder.AddRedis("redis")
    .PublishAsDockerComposeService((resource, service) =>
    {
        service.Name = "cache";
    });

var pgUsername = builder.AddParameter("postgres-username", secret: true);
var pgPassword = builder.AddParameter("postgres-password", secret: true);

var jwtSecret = builder.AddParameter("jwt-secret", secret: true);
var jwtIssuer = builder.AddParameter("jwt-issuer");
var jwtAudience = builder.AddParameter("jwt-audience");
var googleClientId = builder.AddParameter("google-client-id", secret: true);
var googleClientSecret = builder.AddParameter("google-client-secret", secret: true);
var googleRedirectUri = builder.AddParameter("google-redirect-uri");

var pgDb = builder.AddPostgres("postgres", pgUsername, pgPassword)
    .WithDataVolume(isReadOnly: false)
    .WithHostPort(5432)
    .WithPgAdmin(pgAdmin => pgAdmin.WithHostPort(5050))
    .AddDatabase("sportmapdb");

var migrations = builder.AddProject<Projects.SportMap_MigrationService>("migrationservice")
    .WithReference(pgDb)
    .WaitFor(pgDb);

var server = builder.AddProject<Projects.SportMap_PL>("server")
    .WithReference(cache)
    .WaitFor(cache)
    .WithReference(pgDb)
    .WaitFor(pgDb)
    .WaitForCompletion(migrations)
    .WithHttpHealthCheck("/health")
    .WithExternalHttpEndpoints()
    .WithEnvironment("Jwt__SecretKey", jwtSecret)
    .WithEnvironment("Jwt__Issuer", jwtIssuer)
    .WithEnvironment("Jwt__Audience", jwtAudience)
    .WithEnvironment("Google__ClientId", googleClientId)
    .WithEnvironment("Google__ClientSecret", googleClientSecret)
    .WithEnvironment("Google__RedirectUri", googleRedirectUri)
    .PublishAsDockerComposeService((resource, service) =>
    {
        service.Name = "server";
        service.AddVolume(new Aspire.Hosting.Docker.Resources.ServiceNodes.Volume
        {
            Name = "sportmap-images",
            Type = "volume",
            Source = "sportmap-images",
            Target = "/data/images"
        });
    });

if (builder.ExecutionContext.IsPublishMode)
{
    builder.AddDockerfile("webfrontend", "../frontend")
        .WithHttpEndpoint(port: 3000, env: "PORT")
        .WithReference(server)
        .WaitFor(server)
        .WithExternalHttpEndpoints()
        .PublishAsDockerComposeService((resource, service) =>
        {
            service.Name = "webfrontend";
        });
}
else
{
    builder.AddExecutable("webfrontend", "pnpm", "../frontend", "run", "dev")
        .WithHttpEndpoint(port: 3000, env: "PORT")
        .WithReference(server)
        .WaitFor(server)
        .WithExternalHttpEndpoints();
}

builder.Build().Run();