# API de Xadrez — Avaliação Semestral (AS)

API RESTful desenvolvida com **ASP.NET Core** e **.NET 10** utilizando **Minimal API**, com persistência relacional em **SQLite** através do **Entity Framework Core**, arquitetura modularizada por responsabilidade e interface web integrada (HTML5, CSS3 e JavaScript puro).

---

## 1. Nome e Objetivo do Projeto

- **Nome:** API de Xadrez
- **Objetivo:** Sistema de gerenciamento e persistência de partidas de xadrez (enxadristas, resultado e status), evoluído da AP1 e AP2 para atender aos requisitos da Avaliação Semestral (AS). O foco central da AS é a **reorganização arquitetural do backend**, separando tipos por responsabilidade (`Models/`, `Dtos/`, `Data/` e `Program.cs`), mantendo a compatibilidade estrita com o banco SQLite, o frontend integrado e a suíte completa de testes no Bruno.

---

## 2. Tecnologias Utilizadas

- **Linguagem & Plataforma:** C# 14 / .NET 10 SDK
- **Framework Web:** ASP.NET Core (Minimal APIs)
- **Persistência de Dados (ORM):** Entity Framework Core 10 (`Microsoft.EntityFrameworkCore.Sqlite`)
- **Versionamento de Banco:** EF Core Migrations (`Microsoft.EntityFrameworkCore.Design`)
- **Banco de Dados:** SQLite (`xadrez.db`)
- **Frontend Integrado:** HTML5 semântico, CSS3 responsivo (Flexbox/Grid) e JavaScript Vanilla (Fetch API assíncrono)
- **Testes de API:** Bruno (OpenCollection e exportação JSON v2.1)

---

## 3. Requisitos para Execução

- [.NET SDK 10](https://dotnet.microsoft.com/download) ou superior instalado.
- Navegador web moderno (Chrome, Edge, Firefox).
- [Bruno](https://www.usebruno.com/) (opcional, para execução da suíte de testes da API).

---

## 4. Estrutura de Pastas e Responsabilidades

Conforme o conteúdo ensinado em aula, o projeto foi modularizado separando cada tipo em sua respectiva camada de responsabilidade:

```
ApiXadrez/
├── Data/
│   └── AppDbContext.cs             # Contexto do EF Core, mapeamento relacional e seed data
├── Dtos/
│   └── PartidaEntrada.cs           # DTO (Data Transfer Object) de entrada para POST e PUT
├── Models/
│   └── Partida.cs                  # Entidade principal do domínio com propriedades e identificador
├── Migrations/
│   ├── 20261028211846_InitialCreate.cs         # Migration inicial do banco SQLite
│   ├── 20261028211846_InitialCreate.Designer.cs
│   └── AppDbContextModelSnapshot.cs           # Snapshot do modelo de dados
├── Properties/
│   └── launchSettings.json         # Configuração de portas de desenvolvimento (http://localhost:5050)
├── bruno/
│   ├── ApiXadrezBruno/             # Collection nativa do Bruno com ambiente e requisições
│   │   ├── environments/
│   │   │   └── Local.yml           # Variável baseUrl (http://localhost:5050)
│   │   ├── 00 - API no ar.yml
│   │   ├── 01 - Listar registros.yml
│   │   ├── 02 - Criar registro.yml
│   │   ├── 03 - Consultar pelo ID criado.yml
│   │   ├── 04 - Atualizar registro.yml
│   │   ├── 05 - Confirmar atualizacao.yml
│   │   ├── 06 - Excluir registro.yml
│   │   ├── 07 - Consultar registro excluido (404).yml
│   │   ├── 08 - Criar segundo registro (persistencia).yml
│   │   └── 09 - Verificar persistencia apos reiniciar.yml
│   └── ApiXadrezBruno.json         # Coleção exportada para importação direta no Bruno
├── wwwroot/
│   ├── index.html                  # Interface gráfica web
│   ├── app.js                      # Lógica do frontend integrada à API via fetch
│   └── style.css                   # Estilização visual moderna com tema de xadrez
├── ApiXadrez.csproj                # Arquivo de configuração do projeto e dependências NuGet
├── appsettings.json                # Configurações gerais e Connection String do SQLite
├── appsettings.Development.json    # Configurações do ambiente de desenvolvimento
├── dotnet-tools.json               # Manifesto local de ferramentas (dotnet-ef)
├── Program.cs                      # Inicialização, DI, middlewares, migração e endpoints REST
└── README.md                       # Documentação completa do projeto
```

### Responsabilidade de cada módulo:
- **`Models/Partida.cs`:** Define a entidade de negócio `Partida`, contendo `Id`, `JogadorBrancas`, `JogadorPretas`, `Resultado` e `Status`.
- **`Dtos/PartidaEntrada.cs`:** Define o formato dos dados de entrada aceitos pela API nos cadastros e atualizações via `record`, desacoplando a camada externa da entidade do banco.
- **`Data/AppDbContext.cs`:** Configura o `DbContext` do Entity Framework Core, registra o `DbSet<Partida>`, mapeia as propriedades, restrições e carga inicial (Seed) dos dados.
- **`Program.cs`:** Ponto de entrada exclusivo para configuração do host, injeção de dependências, CORS, aplicação de migrations no startup, arquivos estáticos e mapeamento dos endpoints da Minimal API.

---

## 5. Banco de Dados e Migrations

A aplicação utiliza o **SQLite** como banco de dados relacional e o **Entity Framework Core** para gerenciamento de esquema e persistência.

### Migração Automática no Startup
O `Program.cs` está configurado para executar `db.Database.Migrate()` durante a inicialização:
```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
```
Isso garante que:
1. Se o banco `xadrez.db` ainda não existir, ele será criado automaticamente.
2. As migrations pendentes e a carga inicial de dados (Seed: partidas clássicas 1 e 2) serão aplicadas imediatamente, sem intervenção manual.

### Comandos para Preparar o Banco Manualmente (Opcional via CLI)
Caso deseje restaurar ferramentas e atualizar o banco de dados via linha de comando:
```bash
dotnet tool restore
dotnet dotnet-ef database update
```

---

## 6. Comandos para Executar a API

No terminal, dentro da pasta do projeto (`ApiXadrez` ou pasta onde está o `.csproj`):

### 1. Restaurar dependências
```bash
dotnet restore
```

### 2. Compilar o projeto
```bash
dotnet build
```

### 3. Iniciar a API
A porta padrão `5050` já está configurada no `Properties/launchSettings.json`:
```bash
dotnet run
```
Ou especificando a URL explicitamente:
```bash
dotnet run --urls http://localhost:5050
```

---

## 7. Acesso ao Frontend Integrado

Com a API em execução, acesse pelo navegador:

👉 **[http://localhost:5050](http://localhost:5050)** (ou `http://localhost:5050/index.html`)

Pela interface é possível:
- Visualizar todas as partidas salvas no SQLite.
- Consultar partidas por ID existente ou inexistente (observando o tratamento visual de 404).
- Cadastrar novas partidas.
- Editar partidas existentes.
- Excluir partidas com confirmação.
- Confirmar a persistência recarregando a página (`F5`).

---

## 8. Rotas da API e Códigos HTTP (CRUD)

| Método | Rota | Descrição | Código Sucesso | Códigos de Retorno / Erro |
|:---:|---|---|:---:|:---:|
| `GET` | `/` | Status da API ou redirecionamento do navegador | `200 OK` | — |
| `GET` | `/api/partidas` | Lista todas as partidas persistidas no SQLite | `200 OK` | — |
| `GET` | `/api/partidas/{id}` | Busca partida por ID | `200 OK` | `404 Not Found` |
| `POST` | `/api/partidas` | Cadastra nova partida no banco | `201 Created` | `400 Bad Request` |
| `PUT` | `/api/partidas/{id}` | Atualiza partida existente | `200 OK` | `404 Not Found`, `400 Bad Request` |
| `DELETE` | `/api/partidas/{id}` | Exclui partida permanentemente | `204 NoContent` | `404 Not Found` |

---

## 9. Exemplos de Payloads (JSON)

### Cadastrar Partida (`POST /api/partidas`)
```json
{
  "jogadorBrancas": "Garry Kasparov",
  "jogadorPretas": "Viswanathan Anand",
  "resultado": "1/2-1/2",
  "status": "Finalizada"
}
```

### Atualizar Partida (`PUT /api/partidas/3`)
```json
{
  "jogadorBrancas": "Garry Kasparov",
  "jogadorPretas": "Viswanathan Anand",
  "resultado": "1-0",
  "status": "Finalizada"
}
```

---

## 10. Instruções para Abrir e Executar a Collection do Bruno

A pasta `bruno/` contém a suíte completa de testes configurada para validar o fluxo exigido na AS:

### Como abrir no Bruno:
1. Abra o aplicativo **Bruno**.
2. Clique em **Open Collection**.
3. Selecione a pasta `bruno/ApiXadrezBruno` (ou importe o arquivo `bruno/ApiXadrezBruno.json`).
4. Selecione o ambiente **Local** no canto superior direito (configurado com `baseUrl = http://localhost:5050`).

### Sequência de execução dos testes:
Execute as requisições na ordem numérica:
1. **`01 - Listar registros`** (`GET /api/partidas`): Lista as partidas iniciais do banco (`200 OK`).
2. **`02 - Criar registro`** (`POST /api/partidas`): Cadastra Kasparov vs Anand (`201 Created`, ID gerado: `3`).
3. **`03 - Consultar pelo ID criado`** (`GET /api/partidas/3`): Consulta a partida criada pelo seu ID (`200 OK`).
4. **`04 - Atualizar registro`** (`PUT /api/partidas/3`): Altera o resultado para "1-0" (`200 OK`).
5. **`05 - Confirmar atualizacao`** (`GET /api/partidas/3`): Comprova que a alteração foi persistida (`200 OK`).
6. **`06 - Excluir registro`** (`DELETE /api/partidas/3`): Remove a partida do banco (`204 NoContent`).
7. **`07 - Consultar registro excluido (404)`** (`GET /api/partidas/3`): Confirma que o registro não existe mais (`404 Not Found`).
8. **`08 - Criar segundo registro (persistencia)`** (`POST /api/partidas`): Cadastra Ding Liren vs Gukesh D (`201 Created`, ID: `4`).
9. **`09 - Verificar persistencia apos reiniciar`** (`GET /api/partidas/4`): Encerrar a aplicação, iniciá-la novamente e executar esta requisição; o registro permanece no SQLite (`200 OK`).

---

## Vídeo de demonstração — AS

[Cole aqui o link do vídeo de demonstração da AS gravado para entrega]

---

## Histórico de Avaliações:

- **Vídeo da AP2:** [https://youtu.be/qIBNyNw4twc](https://youtu.be/qIBNyNw4twc)
- **Vídeo da AP1:** [https://youtu.be/rj_M4qcEkS4](https://youtu.be/rj_M4qcEkS4)
- **Vídeo da AS:**  [https://youtu.be/Qab5fE6d910](https://youtu.be/Qab5fE6d910)