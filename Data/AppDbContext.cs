using ApiXadrez.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiXadrez.Data;

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

            // Dados iniciais (Seed) preservando os dados clássicos da AP1/AP2
            entity.HasData(
                new Partida(1, "Magnus Carlsen", "Hikaru Nakamura", "1-0", "Finalizada"),
                new Partida(2, "Fabiano Caruana", "Ian Nepomniachtchi", "0-1", "Finalizada")
            );
        });
    }
}
