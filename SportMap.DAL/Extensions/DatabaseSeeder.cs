using Microsoft.EntityFrameworkCore;
using SportMap.DAL.DataContext;

namespace SportMap.DAL.Extensions;

public static class DatabaseSeeder
{
    /// <summary>
    /// Seeds sample data for local development. Idempotent — seed rows use
    /// ON CONFLICT to avoid duplicates while keeping dates fresh.
    /// </summary>
    public static void Seed(this AppDbContext db)
    {
        SeedEvents(db);
    }

    private static void SeedEvents(AppDbContext db)
    {
        db.Database.ExecuteSqlRaw("""
            INSERT INTO "Events" ("Id", "PlaceId", "HostUserId", "Title", "Description", "StartTime", "Capacity", "Status", "CreatedAt")
            VALUES
                ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
                 'Morning Run at Kadriorg', 'Casual 5K group run through Kadriorg Park. All paces welcome!',
                 DATE_TRUNC('day', NOW()) + INTERVAL '1 day' + INTERVAL '8 hours', 20, 0, NOW()),
                ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
                 'Basketball Pickup Game', '3v3 half-court games. Bring water!',
                 DATE_TRUNC('day', NOW()) + INTERVAL '2 days' + INTERVAL '17 hours', 12, 0, NOW()),
                ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
                 'Weekend Football Match', 'Friendly 5-a-side match, all skill levels.',
                 DATE_TRUNC('day', NOW()) + INTERVAL '3 days' + INTERVAL '12 hours', 10, 0, NOW()),
                ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
                 'Beach Volleyball Tournament', 'Doubles tournament at Pirita. Sign up as a pair!',
                 DATE_TRUNC('day', NOW()) + INTERVAL '5 days' + INTERVAL '15 hours', 16, 0, NOW()),
                ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
                 'Skate Session', 'Open skate session for all levels. Helmets recommended.',
                 DATE_TRUNC('day', NOW()) + INTERVAL '4 days' + INTERVAL '18 hours', NULL, 0, NOW())
            ON CONFLICT ("Id") DO UPDATE SET "StartTime" = EXCLUDED."StartTime";
            """);
    }
}
