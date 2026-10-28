# API de Xadrez — AP2

API REST desenvolvida com **ASP.NET Core** e **.NET 10** utilizando **Minimal API**, com persistência em banco de dados **SQLite** através do **Entity Framework Core** e interface web integrada (HTML, CSS e JavaScript puros).

---

## Sobre o Projeto

O projeto consiste em um sistema completo para gerenciamento de partidas de xadrez, desenvolvido como evolução da AP1 para a AP2.

As partidas são persistidas em um banco de dados relacional **SQLite** (`xadrez.db`) gerenciado pelo **Entity Framework Core**. Dessa forma, todas as partidas cadastradas, alteradas ou excluídas permanecem permanentemente armazenadas no banco de dados, sobrevivendo ao encerramento e reinicialização da aplicação ou ao recarregamento da página web (`F5`).

---

## Tecnologias Utilizadas

- **C# 14 / .NET 10**
- **ASP.NET Core (Minimal API)**
- **Entity Framework Core 10** (ORM)
- **SQLite** (`Microsoft.EntityFrameworkCore.Sqlite`)
- **EF Core Migrations** (`Microsoft.EntityFrameworkCore.Design`)
- **Frontend Vanilla:** HTML5 semântico, CSS3 responsivo (Grid e Flexbox) e JavaScript puro (Fetch API)
- **Bruno** (testes automatizados de API)

---

## Recurso Principal: `Partida`

Cada partida de xadrez possui os seguintes campos:

| Campo | Tipo | Descrição | Exemplo |
| :--- | :--- | :--- | :--- |
| `id` | `int` | Identificador único autoincrementado (Chave Primária) | `1` |
| `jogadorBrancas` | `string` | Nome do enxadrista com as peças brancas | `"Magnus Carlsen"` |
| `jogadorPretas` | `string` | Nome do enxadrista com as peças pretas | `"Hikaru Nakamura"` |
| `resultado` | `string` | Desfecho da partida (`"1-0"`, `"0-1"`, `"1/2-1/2"`, `"*"`)| `"1-0"` |
| `status` | `string` | Situação da partida (`"Finalizada"`, `"Em andamento"`, etc.)| `"Finalizada"` |

---

## Rotas da API e Códigos HTTP

A API segue os padrões RESTful com os seguintes endpoints:

| Método | Rota | Descrição | Código de Sucesso | Código de Erro |
|---|---|---|:---:|:---:|
| `GET` | `/` | Verifica se a API está online (ou redireciona navegadores para `/index.html`) | `200 OK` | — |
| `GET` | `/api/partidas` | Lista todas as partidas persistidas no SQLite | `200 OK` | — |
| `GET` | `/api/partidas/{id}` | Busca uma partida por ID (existente ou inexistente) | `200 OK` | `404 Not Found` |
| `POST` | `/api/partidas` | Cadastra uma nova partida no banco SQLite | `201 Created` | `400 Bad Request` |
| `PUT` | `/api/partidas/{id}` | Atualiza uma partida existente no banco | `200 OK` | `404 Not Found` |
| `DELETE` | `/api/partidas/{id}` | Remove uma partida permanentemente do SQLite | `204 NoContent` | `404 Not Found` |

### Exemplos de Cargas (Payloads)

#### Cadastrar Partida (`POST /api/partidas`)
```json
{
  "jogadorBrancas": "Ding Liren",
  "jogadorPretas": "Gukesh D",
  "resultado": "1/2-1/2",
  "status": "Finalizada"
}
```

#### Atualizar Partida (`PUT /api/partidas/1`)
```json
{
  "jogadorBrancas": "Magnus Carlsen",
  "jogadorPretas": "Hikaru Nakamura",
  "resultado": "1/2-1/2",
  "status": "Finalizada"
}
```

---

## Pré-requisitos

- [.NET SDK 10](https://dotnet.microsoft.com/download) instalado.

---

## Como Executar o Projeto

### 1. Clonar e Restaurar Dependências
No terminal, dentro da pasta do projeto:
```bash
dotnet restore
```

### 2. Banco de Dados e Migrations
A aplicação foi configurada com migração automática na inicialização (`db.Database.Migrate()`). Assim que a API inicia, o arquivo `xadrez.db` é criado ou atualizado automaticamente a partir das migrations versionadas.

Caso queira aplicar as migrations manualmente via CLI:
```bash
dotnet tool restore
dotnet dotnet-ef database update
```

### 3. Iniciar a Aplicação
Inicie a API apontando para a porta `5050` padrão:
```bash
dotnet run --urls http://localhost:5050
```
> **Nota para Windows (caso o SDK esteja em x86):**  
> Se o comando genérico `dotnet run` informar que o SDK não foi encontrado devido à ordem de variáveis no `PATH`, execute apontando para o SDK:
> ```powershell
> & "C:\Program Files (x86)\dotnet\dotnet.exe" run --urls http://localhost:5050
> ```

---

## Como Acessar a Interface Web (Frontend)

Com a API em execução, abra o seu navegador de preferência e acesse:

👉 **[http://localhost:5050](http://localhost:5050)** (ou `http://localhost:5050/index.html`)

Na interface você poderá:
1. **Visualizar a lista** de partidas recuperadas do banco SQLite.
2. **Consultar por ID** partidas existentes (ex.: ID `1`) ou inexistentes (ex.: ID `999`), observando o tratamento visual de sucesso e de `404 Not Found`.
3. **Cadastrar** novas partidas com validação e salvamento direto no banco.
4. **Editar** partidas existentes carregando os dados no formulário.
5. **Excluir** partidas com confirmação.
6. **Comprovar a persistência:** pressione **F5** no navegador ou encerre e reinicie o servidor. Os dados cadastrados continuam salvos no SQLite!

---

## Testes com a Collection do Bruno

A pasta `bruno/ApiXadrezBruno` contém a coleção de testes pronta:

1. Abra o **Bruno**.
2. Clique em **Open Collection** e selecione a pasta `bruno/ApiXadrezBruno`.
3. Selecione o ambiente **Local** (que aponta para `http://localhost:5050`).
4. Execute as requisições na ordem sugerida:
   - `00 - API no ar` (GET `/` -> `200 OK`)
   - `01 - Listar` (GET `/api/partidas` -> `200 OK`)
   - `02 - Buscar por id` (GET `/api/partidas/1` -> `200 OK`)
   - `02b - Buscar por id (Inexistente)` (GET `/api/partidas/999` -> `404 Not Found`)
   - `03 - Cadastrar` (POST `/api/partidas` -> `201 Created`)
   - `04 - Atualizar` (PUT `/api/partidas/1` -> `200 OK`)
   - `05 - Remover` (DELETE `/api/partidas/3` -> `204 NoContent`)
   - `06 - Confirmar Remocao` (GET `/api/partidas/3` -> `404 Not Found`)

---

## Vídeo de demonstração — AP2

[LINK PÚBLICO DO VÍDEO AQUI]

---

## Histórico da AP1

- Link da AP1: [https://youtu.be/rj_M4qcEkS4](https://youtu.be/rj_M4qcEkS4)
