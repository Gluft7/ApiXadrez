namespace ApiXadrez.Models;

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
