using System.Diagnostics;
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
    public const string ActivitySourceName = "Migrations";
    private static readonly ActivitySource s_activitySource = new(ActivitySourceName);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var activity = s_activitySource.StartActivity("Migrating database", ActivityKind.Client);

        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            await RunMigrationAsync(db, logger, stoppingToken);

            if (environment.IsDevelopment())
            {
                logger.LogInformation("{Worker}: seeding development data.", nameof(MigrationWorker));
                db.Seed();
            }
        }
        catch (Exception ex)
        {
            activity?.AddException(ex);
            logger.LogCritical(ex, "{Worker}: migration failed — server will not start.", nameof(MigrationWorker));
            throw;
        }

        lifetime.StopApplication();
    }

    private static async Task RunMigrationAsync(
        AppDbContext db,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        var pending = (await db.Database.GetPendingMigrationsAsync(cancellationToken)).ToList();

        if (pending.Count == 0)
        {
            logger.LogInformation("{Worker}: database is up to date, no pending migrations.", nameof(MigrationWorker));
            return;
        }

        logger.LogInformation(
            "{Worker}: applying {Count} pending migration(s): {Migrations}",
            nameof(MigrationWorker), pending.Count, string.Join(", ", pending));

        var strategy = db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(() => db.Database.MigrateAsync(cancellationToken));

        logger.LogInformation("{Worker}: all migrations applied successfully.", nameof(MigrationWorker));
    }
}
