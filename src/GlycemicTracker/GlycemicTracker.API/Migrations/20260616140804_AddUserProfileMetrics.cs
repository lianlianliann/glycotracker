using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace GlycemicTracker.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "daily_gl_summaries",
                columns: table => new
                {
                    summary_id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    total_gl = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    entry_count = table.Column<short>(type: "smallint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_daily_gl_summaries", x => x.summary_id);
                });

            migrationBuilder.CreateTable(
                name: "ingredients",
                columns: table => new
                {
                    ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    local_name = table.Column<string>(type: "text", nullable: true),
                    base_gi = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    calories_per_100g = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    carbs_per_100g = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    protein_per_100g = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    fat_per_100g = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    fiber_per_100g = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ingredients", x => x.ingredient_id);
                });

            migrationBuilder.CreateTable(
                name: "preparation_methods",
                columns: table => new
                {
                    prep_method_id = table.Column<short>(type: "smallint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    method_name = table.Column<string>(type: "text", nullable: false),
                    gi_multiplier = table.Column<decimal>(type: "numeric(4,3)", precision: 4, scale: 3, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    icon_key = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_preparation_methods", x => x.prep_method_id);
                });

            migrationBuilder.CreateTable(
                name: "user_profiles",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: true),
                    daily_gl_target = table.Column<decimal>(type: "numeric(5,1)", precision: 5, scale: 1, nullable: false),
                    diabetes_type = table.Column<string>(type: "text", nullable: true),
                    timezone = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    height = table.Column<decimal>(type: "numeric", nullable: true),
                    weight = table.Column<decimal>(type: "numeric", nullable: true),
                    activity_level = table.Column<string>(type: "text", nullable: true),
                    daily_gi_target = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_profiles", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "meal_entries",
                columns: table => new
                {
                    entry_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ingredient_id = table.Column<Guid>(type: "uuid", nullable: false),
                    prep_method_id = table.Column<short>(type: "smallint", nullable: false),
                    grams_consumed = table.Column<decimal>(type: "numeric(6,1)", precision: 6, scale: 1, nullable: false),
                    net_carbs = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    modified_gi = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    final_gl = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    meal_type = table.Column<string>(type: "text", nullable: true),
                    logged_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    calories_consumed = table.Column<decimal>(type: "numeric(7,2)", precision: 7, scale: 2, nullable: true),
                    protein_consumed = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true),
                    fat_consumed = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_meal_entries", x => x.entry_id);
                    table.ForeignKey(
                        name: "FK_meal_entries_ingredients_ingredient_id",
                        column: x => x.ingredient_id,
                        principalTable: "ingredients",
                        principalColumn: "ingredient_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_meal_entries_preparation_methods_prep_method_id",
                        column: x => x.prep_method_id,
                        principalTable: "preparation_methods",
                        principalColumn: "prep_method_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_daily_gl_summaries_user_id_date",
                table: "daily_gl_summaries",
                columns: new[] { "user_id", "date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_meal_entries_ingredient_id",
                table: "meal_entries",
                column: "ingredient_id");

            migrationBuilder.CreateIndex(
                name: "IX_meal_entries_prep_method_id",
                table: "meal_entries",
                column: "prep_method_id");

            migrationBuilder.CreateIndex(
                name: "IX_meal_entries_user_id_logged_at",
                table: "meal_entries",
                columns: new[] { "user_id", "logged_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "daily_gl_summaries");

            migrationBuilder.DropTable(
                name: "meal_entries");

            migrationBuilder.DropTable(
                name: "user_profiles");

            migrationBuilder.DropTable(
                name: "ingredients");

            migrationBuilder.DropTable(
                name: "preparation_methods");
        }
    }
}
