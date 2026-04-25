using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportMap.DAL.Migrations
{
    /// <inheritdoc />
    public partial class SeedPrivacyTypes : Migration
    {
        private static readonly Guid PublicId  = new("00000000-0000-0000-0000-000000000001");
        private static readonly Guid PrivateId = new("00000000-0000-0000-0000-000000000002");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "PrivacyTypes",
                columns: ["Id", "Name", "Description", "CreatedAt", "ModifiedAt", "RemovedAt", "XMin"],
                values: new object[,]
                {
                    { PublicId,  "public",  "Visible to everyone", DateTime.UtcNow, null, null, 0u },
                    { PrivateId, "private", "Visible only to you", DateTime.UtcNow, null, null, 0u },
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PrivacyTypes",
                keyColumn: "Id",
                keyValues: new object[] { PublicId, PrivateId });
        }
    }
}
