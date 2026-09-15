var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

var partidas = new List<Partida>
{
    new Partida(1, "Magnus Carlsen", "Hikaru Nakamura", "1-0", "Finalizada"),
    new Partida(2, "Fabiano Caruana", "Ian Nepomniachtchi", "0-1", "Finalizada")
};

app.MapGet("/", () => "API de Xadrez está no ar!");
app.MapGet("/api/partidas/{id}", (int id) =>
{
    var partida = partidas.FirstOrDefault(p => p.Id == id);

    if (partida is null)
        return Results.NotFound();

    return Results.Ok(partida);
});
app.MapPost("/api/partidas", (PartidaEntrada entrada) =>
{
    var novoId = partidas.Count > 0 ? partidas.Max(p => p.Id) + 1 : 1;

    var novaPartida = new Partida(
        novoId,
        entrada.JogadorBrancas,
        entrada.JogadorPretas,
        entrada.Resultado,
        entrada.Status
    );

    partidas.Add(novaPartida);

    return Results.Created($"/api/partidas/{novoId}", novaPartida);
});

app.MapPut("/api/partidas/{id}", (int id, PartidaEntrada entrada) =>
{
    var indice = partidas.FindIndex(p => p.Id == id);

    if (indice == -1)
        return Results.NotFound();

    var partidaAtualizada = new Partida(
        id,
        entrada.JogadorBrancas,
        entrada.JogadorPretas,
        entrada.Resultado,
        entrada.Status
    );

    partidas[indice] = partidaAtualizada;

    return Results.Ok(partidaAtualizada);
});

app.MapGet("/api/partidas", () => Results.Ok(partidas));

app.MapDelete("/api/partidas/{id}", (int id) =>
{
    var partida = partidas.FirstOrDefault(p => p.Id == id);

    if (partida is null)
        return Results.NotFound();

    partidas.Remove(partida);

    return Results.NoContent();
});

app.Run();

record Partida(
    int Id,
    string JogadorBrancas,
    string JogadorPretas,
    string Resultado,
    string Status
);

record PartidaEntrada(
    string JogadorBrancas,
    string JogadorPretas,
    string Resultado,
    string Status
);