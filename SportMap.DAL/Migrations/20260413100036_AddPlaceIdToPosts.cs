using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SportMap.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaceIdToPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PlaceId",
                table: "Posts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Posts_PlaceId",
                table: "Posts",
                column: "PlaceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Posts_Places_PlaceId",
                table: "Posts",
                column: "PlaceId",
                principalTable: "Places",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Posts_Places_PlaceId",
                table: "Posts");

            migrationBuilder.DropIndex(
                name: "IX_Posts_PlaceId",
                table: "Posts");

            migrationBuilder.DropColumn(
                name: "PlaceId",
                table: "Posts");
        }
    }
}
