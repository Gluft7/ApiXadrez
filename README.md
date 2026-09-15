# API de Xadrez

API REST desenvolvida com ASP.NET Core e .NET 10 utilizando Minimal API.

## Sobre o projeto

O projeto consiste em uma API para gerenciamento de partidas de xadrez.

Os dados são armazenados temporariamente em uma `List<T>` na memória, portanto são perdidos quando a aplicação é reiniciada.

## Tecnologias

- C#
- ASP.NET Core
- .NET 10
- Minimal API
- Bruno

## Recurso principal

O recurso principal da API é `Partida`.

Cada partida possui:

- Id
- Jogador das brancas
- Jogador das pretas
- Resultado
- Status

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/` | Verifica se a API está no ar |
| GET | `/api/partidas` | Lista todas as partidas |
| GET | `/api/partidas/{id}` | Busca uma partida por ID |
| POST | `/api/partidas` | Cadastra uma nova partida |
| PUT | `/api/partidas/{id}` | Atualiza uma partida |
| DELETE | `/api/partidas/{id}` | Remove uma partida |

## Como executar

No terminal, dentro da pasta do projeto:

```bash
dotnet run --urls http://localhost:5050