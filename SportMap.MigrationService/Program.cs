using Microsoft.Extensions.Hosting;
using OpenTelemetry;
using OpenTelemetry.Trace;
using SportMap.DAL.DataContext;
using SportMap.MigrationService;

var builder = Host.CreateApplicationBuilder(args);

builder.AddNpgsqlDbContext<AppDbContext>("sportmapdb");
builder.Services.AddHostedService<MigrationWorker>();

builder.Services.AddOpenTelemetry()
    .UseOtlpExporter()
    .WithTracing(tracing => tracing.AddSource(MigrationWorker.ActivitySourceName));

builder.Build().Run();
