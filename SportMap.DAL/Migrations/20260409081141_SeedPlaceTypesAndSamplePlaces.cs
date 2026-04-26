using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportMap.DAL.Migrations
{
    /// <inheritdoc />
    public partial class SeedPlaceTypesAndSamplePlaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO "Users" ("Id", "Email", "UserName", "FirstName", "LastName", "GoogleId", "UserRoleId", "CreatedAt")
                VALUES ('00000000-0000-0000-0000-000000000001', 'system@sportmap.ee', 'system', 'System', 'User', 'system', (SELECT "Id" FROM "UserRoles" LIMIT 1), NOW())
                ON CONFLICT ("Id") DO NOTHING;
            """);

            migrationBuilder.Sql("""
                INSERT INTO "PlaceTypes" ("Id", "Name", "Description", "CreatedAt")
                VALUES
                    ('a0000000-0000-0000-0000-000000000001', 'Basketball Court', 'Outdoor or indoor basketball court',   NOW()),
                    ('a0000000-0000-0000-0000-000000000002', 'Football Field',   'Football / soccer field',              NOW()),
                    ('a0000000-0000-0000-0000-000000000003', 'Running Track',    'Running or jogging track',             NOW()),
                    ('a0000000-0000-0000-0000-000000000004', 'Tennis Court',     'Outdoor or indoor tennis court',       NOW()),
                    ('a0000000-0000-0000-0000-000000000005', 'Gym',              'Indoor fitness gym',                   NOW()),
                    ('a0000000-0000-0000-0000-000000000006', 'Skate Park',       'Skateboarding or inline skating park', NOW()),
                    ('a0000000-0000-0000-0000-000000000007', 'Swimming Pool',    'Indoor or outdoor swimming pool',      NOW()),
                    ('a0000000-0000-0000-0000-000000000008', 'Park',             'Public park or green area',            NOW())
                ON CONFLICT ("Id") DO NOTHING;
            """);

            migrationBuilder.Sql("""
                INSERT INTO "Places" ("Id", "Name", "Description", "PlaceTypeId", "Latitude", "Longitude", "Address", "CreatorId", "Status", "CreatedAt")
                VALUES
                    ('b0000000-0000-0000-0000-000000000001', 'Kadriorg Park Running Loop',  'Popular 3 km loop through Kadriorg Park',         'a0000000-0000-0000-0000-000000000003', 59.4388, 24.7910, 'Kadriorg, Tallinn',                '00000000-0000-0000-0000-000000000001', 0, NOW()),
                    ('b0000000-0000-0000-0000-000000000002', 'Tondiraba Ice Hall Courts',    'Basketball courts next to Tondiraba Ice Hall',     'a0000000-0000-0000-0000-000000000001', 59.4470, 24.8310, 'Pärnamäe tee 36, Tallinn',         '00000000-0000-0000-0000-000000000001', 0, NOW()),
                    ('b0000000-0000-0000-0000-000000000003', 'Lilleküla Stadium',            'Football field open for community events',         'a0000000-0000-0000-0000-000000000002', 59.4240, 24.7070, 'A. H. Tammsaare tee 104, Tallinn', '00000000-0000-0000-0000-000000000001', 0, NOW()),
                    ('b0000000-0000-0000-0000-000000000004', 'Pirita Beach Volleyball',      'Beach volleyball courts at Pirita',                'a0000000-0000-0000-0000-000000000008', 59.4690, 24.8360, 'Pirita tee, Tallinn',              '00000000-0000-0000-0000-000000000001', 0, NOW()),
                    ('b0000000-0000-0000-0000-000000000005', 'Tallinn Skateboard Park',      'City center skate park near Telliskivi',           'a0000000-0000-0000-0000-000000000006', 59.4400, 24.7290, 'Telliskivi, Tallinn',              '00000000-0000-0000-0000-000000000001', 0, NOW())
                ON CONFLICT ("Id") DO NOTHING;
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM "Places" WHERE "Id" IN (
                    'b0000000-0000-0000-0000-000000000001',
                    'b0000000-0000-0000-0000-000000000002',
                    'b0000000-0000-0000-0000-000000000003',
                    'b0000000-0000-0000-0000-000000000004',
                    'b0000000-0000-0000-0000-000000000005'
                );
                DELETE FROM "PlaceTypes" WHERE "Id" IN (
                    'a0000000-0000-0000-0000-000000000001',
                    'a0000000-0000-0000-0000-000000000002',
                    'a0000000-0000-0000-0000-000000000003',
                    'a0000000-0000-0000-0000-000000000004',
                    'a0000000-0000-0000-0000-000000000005',
                    'a0000000-0000-0000-0000-000000000006',
                    'a0000000-0000-0000-0000-000000000007',
                    'a0000000-0000-0000-0000-000000000008'
                );
                DELETE FROM "Users" WHERE "Id" = '00000000-0000-0000-0000-000000000001';
            """);
        }
    }
}
