using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ApiXadrez.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Partidas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    JogadorBrancas = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    JogadorPretas = table.Column<string>(type: "TEXT", maxLength: 150, nullable: false),
                    Resultado = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partidas", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Partidas",
                columns: new[] { "Id", "JogadorBrancas", "JogadorPretas", "Resultado", "Status" },
                values: new object[,]
                {
                    { 1, "Magnus Carlsen", "Hikaru Nakamura", "1-0", "Finalizada" },
                    { 2, "Fabiano Caruana", "Ian Nepomniachtchi", "0-1", "Finalizada" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Partidas");
        }
    }
}
