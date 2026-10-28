using ApiXadrez;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração do SQLite com EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=xadrez.db";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Aplicação automática das Migrations / Criação e atualização do banco na inicialização
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

// Rota raiz (verifica API ou redireciona navegador para o frontend)
app.MapGet("/", (HttpContext context) =>
{
    if (context.Request.Headers.Accept.ToString().Contains("text/html"))
    {
        return Results.Redirect("/index.html");
    }
    return Results.Text("API de Xadrez está no ar!");
});

// GET /api/partidas - Listar todas as partidas do banco
app.MapGet("/api/partidas", async (AppDbContext db) =>
{
    var partidas = await db.Partidas.AsNoTracking().ToListAsync();
    return Results.Ok(partidas);
});

// GET /api/partidas/{id} - Buscar partida por ID
app.MapGet("/api/partidas/{id:int}", async (int id, AppDbContext db) =>
{
    var partida = await db.Partidas.FindAsync(id);
    if (partida is null)
        return Results.NotFound();

    return Results.Ok(partida);
});

// POST /api/partidas - Cadastrar nova partida
app.MapPost("/api/partidas", async (PartidaEntrada entrada, AppDbContext db) =>
{
    var novaPartida = new Partida
    {
        JogadorBrancas = entrada.JogadorBrancas,
        JogadorPretas = entrada.JogadorPretas,
        Resultado = entrada.Resultado,
        Status = entrada.Status
    };

    await db.Partidas.AddAsync(novaPartida);
    await db.SaveChangesAsync();

    return Results.Created($"/api/partidas/{novaPartida.Id}", novaPartida);
});

// PUT /api/partidas/{id} - Atualizar partida existente
app.MapPut("/api/partidas/{id:int}", async (int id, PartidaEntrada entrada, AppDbContext db) =>
{
    var partida = await db.Partidas.FindAsync(id);
    if (partida is null)
        return Results.NotFound();

    partida.JogadorBrancas = entrada.JogadorBrancas;
    partida.JogadorPretas = entrada.JogadorPretas;
    partida.Resultado = entrada.Resultado;
    partida.Status = entrada.Status;

    await db.SaveChangesAsync();

    return Results.Ok(partida);
});

// DELETE /api/partidas/{id} - Remover partida
app.MapDelete("/api/partidas/{id:int}", async (int id, AppDbContext db) =>
{
    var partida = await db.Partidas.FindAsync(id);
    if (partida is null)
        return Results.NotFound();

    db.Partidas.Remove(partida);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
