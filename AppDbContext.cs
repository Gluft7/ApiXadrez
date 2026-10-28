using Microsoft.EntityFrameworkCore;

namespace ApiXadrez;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Partida> Partidas => Set<Partida>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Partida>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.JogadorBrancas).IsRequired().HasMaxLength(150);
            entity.Property(p => p.JogadorPretas).IsRequired().HasMaxLength(150);
            entity.Property(p => p.Resultado).IsRequired().HasMaxLength(50);
            entity.Property(p => p.Status).IsRequired().HasMaxLength(50);

            // Dados iniciais (Seed) preservando os dados clássicos da AP1
            entity.HasData(
                new Partida(1, "Magnus Carlsen", "Hikaru Nakamura", "1-0", "Finalizada"),
                new Partida(2, "Fabiano Caruana", "Ian Nepomniachtchi", "0-1", "Finalizada")
            );
        });
    }
}

public class Partida
{
    public int Id { get; set; }
    public string JogadorBrancas { get; set; } = string.Empty;
    public string JogadorPretas { get; set; } = string.Empty;
    public string Resultado { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    public Partida() { }

    public Partida(int id, string jogadorBrancas, string jogadorPretas, string resultado, string status)
    {
        Id = id;
        JogadorBrancas = jogadorBrancas;
        JogadorPretas = jogadorPretas;
        Resultado = resultado;
        Status = status;
    }
}

public record PartidaEntrada(
    string JogadorBrancas,
    string JogadorPretas,
    string Resultado,
    string Status
);
