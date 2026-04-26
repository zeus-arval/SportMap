using Microsoft.Extensions.Hosting;
using SportMap.DAL.DataContext;
using SportMap.MigrationService;

var builder = Host.CreateApplicationBuilder(args);
builder.AddNpgsqlDbContext<AppDbContext>("sportmapdb");
builder.Services.AddHostedService<MigrationWorker>();
builder.Build().Run();
