using Microsoft.EntityFrameworkCore;
using SportMap.DAL.DataContext;
using SportMap.DAL.Extensions;

namespace SportMap.MigrationService;

public class MigrationWorker(
    IServiceProvider services,
    IHostEnvironment environment,
    IHostApplicationLifetime lifetime,
    ILogger<MigrationWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var pending = (await db.Database.GetPendingMigrationsAsync(stoppingToken)).ToList();

            if (pending.Count == 0)
            {
                logger.LogInformation("{Worker}: database is up to date, no pending migrations.", nameof(MigrationWorker));
            }
            else
            {
                logger.LogInformation("{Worker}: applying {Count} pending migration(s): {Migrations}",
                    nameof(MigrationWorker), pending.Count, string.Join(", ", pending));
                await db.Database.MigrateAsync(stoppingToken);
                logger.LogInformation("{Worker}: all migrations applied successfully.", nameof(MigrationWorker));
            }

            if (environment.IsDevelopment())
            {
                logger.LogInformation("{Worker}: seeding development data.", nameof(MigrationWorker));
                db.Seed();
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            logger.LogWarning("{Worker}: migration cancelled.", nameof(MigrationWorker));
            Environment.ExitCode = 1;
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "{Worker}: migration failed — server will not start.", nameof(MigrationWorker));
            Environment.ExitCode = 1;
        }

        lifetime.StopApplication();
    }
}
