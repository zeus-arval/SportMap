using Microsoft.Extensions.Hosting;
using OpenTelemetry.Trace;
using SportMap.DAL.DataContext;
using SportMap.MigrationService;

var builder = Host.CreateApplicationBuilder(args);

builder.AddServiceDefaults();

builder.AddNpgsqlDbContext<AppDbContext>("sportmapdb");
builder.Services.AddHostedService<MigrationWorker>();

builder.Services.ConfigureOpenTelemetryTracerProvider(tracing =>
    tracing.AddSource(MigrationWorker.ActivitySourceName));

builder.Build().Run();
