'use strict';

(function () {
  const API_BASE_URL = (window.location.protocol === 'http:' || window.location.protocol === 'https:')
    ? window.location.origin
    : 'http://localhost:5050';

  const ENDPOINT_PARTIDAS = `${API_BASE_URL}/api/partidas`;

  let partidasAtuais = [];
  let partidaEmEdicaoId = null;
  let filtroIdAtivo = null;
  let feedbackTimeout = null;

  let formPartida;
  let inputId;
  let inputBrancas;
  let inputPretas;
  let selectResultado;
  let selectStatus;
  let btnSubmit;
  let btnSubmitText;
  let btnSubmitIcon;
  let btnCancelar;
  let formHeading;
  let formModeBadge;

  let tabelaCorpo;
  let tableContainer;
  let emptyState;
  let emptyStateTitle;
  let emptyStateHelp;
  let loadingIndicator;
  let connectionError;
  let connectionErrorMsg;
  let contadorPartidas;
  let feedbackArea;

  let btnRecarregar;
  let btnTentarNovamente;
  let inputBuscaId;
  let btnBuscarId;
  let btnLimparBusca;
  let apiStatusBadge;
  let apiStatusText;

  document.addEventListener('DOMContentLoaded', () => {
    mapearElementosDOM();
    vincularEventos();
    carregarPartidasAPI();
  });


  function mapearElementosDOM() {
    formPartida = document.getElementById('form-partida');
    inputId = document.getElementById('partida-id');
    inputBrancas = document.getElementById('jogador-brancas');
    inputPretas = document.getElementById('jogador-pretas');
    selectResultado = document.getElementById('resultado');
    selectStatus = document.getElementById('status');

    btnSubmit = document.getElementById('btn-submit');
    btnSubmitText = document.getElementById('btn-submit-text');
    btnSubmitIcon = document.getElementById('btn-submit-icon');
    btnCancelar = document.getElementById('btn-cancelar');

    formHeading = document.getElementById('form-heading');
    formModeBadge = document.getElementById('form-mode-badge');

    tabelaCorpo = document.getElementById('tabela-partidas-corpo');
    tableContainer = document.getElementById('table-container');
    emptyState = document.getElementById('empty-state');
    emptyStateTitle = document.getElementById('empty-state-title');
    emptyStateHelp = document.getElementById('empty-state-help');
    loadingIndicator = document.getElementById('loading-indicator');
    connectionError = document.getElementById('connection-error');
    connectionErrorMsg = document.getElementById('connection-error-msg');
    contadorPartidas = document.getElementById('contador-partidas');
    feedbackArea = document.getElementById('feedback-area');

    btnRecarregar = document.getElementById('btn-recarregar');
    btnTentarNovamente = document.getElementById('btn-tentar-novamente');
    inputBuscaId = document.getElementById('input-busca-id');
    btnBuscarId = document.getElementById('btn-buscar-id');
    btnLimparBusca = document.getElementById('btn-limpar-busca');

    apiStatusBadge = document.getElementById('api-status-badge');
    apiStatusText = document.getElementById('api-status-text');
  }

  function vincularEventos() {
    formPartida.addEventListener('submit', lidarSubmissaoFormulario);
    btnCancelar.addEventListener('click', limparECancelarEdicao);

    btnRecarregar.addEventListener('click', () => {
      filtroIdAtivo = null;
      if (inputBuscaId) inputBuscaId.value = '';
      if (btnLimparBusca) btnLimparBusca.hidden = true;
      carregarPartidasAPI();
    });

    btnTentarNovamente.addEventListener('click', () => {
      carregarPartidasAPI();
    });

    btnBuscarId.addEventListener('click', consultarPorId);
    inputBuscaId.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        consultarPorId();
      }
    });

    btnLimparBusca.addEventListener('click', () => {
      filtroIdAtivo = null;
      inputBuscaId.value = '';
      btnLimparBusca.hidden = true;
      renderizarTabela(partidasAtuais);
      exibirMensagem('Exibindo todas as partidas cadastradas no SQLite.', 'info');
    });

    // Delegação de eventos para botões de ação na tabela (Editar / Excluir)
    tabelaCorpo.addEventListener('click', (event) => {
      const target = event.target.closest('button[data-action]');
      if (!target) return;

      const acao = target.getAttribute('data-action');
      const id = parseInt(target.getAttribute('data-id'), 10);

      if (acao === 'edit') {
        iniciarEdicao(id);
      } else if (acao === 'delete') {
        confirmarExclusao(id);
      }
    });
  }

  /**
   * =========================================================================
   * OPERAÇÕES COM A API REAL (EF CORE + SQLITE)
   * =========================================================================
   */

  /**
   * GET /api/partidas - Lista todas as partidas persistidas no SQLite
   */
  async function carregarPartidasAPI() {
    exibirCarregando(true);
    ocultarErroConexao();

    try {
      const response = await fetch(ENDPOINT_PARTIDAS, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const dados = await response.json();
      partidasAtuais = Array.isArray(dados) ? dados : [];

      atualizarStatusAPI(true);
      renderizarTabela(partidasAtuais);
      exibirMensagem('Partidas sincronizadas com o banco SQLite com sucesso.', 'info');
    } catch (erro) {
      console.error('Falha ao carregar partidas da API:', erro);
      atualizarStatusAPI(false);
      exibirErroConexao(`Não foi possível conectar à API em ${ENDPOINT_PARTIDAS}. (${erro.message})`);
    } finally {
      exibirCarregando(false);
    }
  }

  /**
   * GET /api/partidas/{id} - Consulta uma partida específica por ID (Existente ou Inexistente)
   */
  async function consultarPorId() {
    const idValor = inputBuscaId.value.trim();
    if (!idValor) {
      exibirMensagem('Informe um número de ID para consultar.', 'erro');
      inputBuscaId.focus();
      return;
    }

    const id = parseInt(idValor, 10);
    if (isNaN(id) || id <= 0) {
      exibirMensagem('O ID deve ser um número inteiro positivo.', 'erro');
      inputBuscaId.focus();
      return;
    }

    exibirCarregando(true);
    ocultarErroConexao();

    try {
      const response = await fetch(`${ENDPOINT_PARTIDAS}/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 404) {
        filtroIdAtivo = id;
        btnLimparBusca.hidden = false;
        renderizarTabela(
          [],
          `Partida #${id} não encontrada no banco SQLite (404 Not Found).`,
          'O registro não existe ou já foi excluído. Clique em "Mostrar Todas" para restaurar a lista.'
        );
        exibirMensagem(`Aviso: Partida #${id} não foi encontrada no banco de dados (HTTP 404).`, 'erro');
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const partida = await response.json();
      filtroIdAtivo = id;
      btnLimparBusca.hidden = false;

      // Renderiza apenas a partida consultada
      renderizarTabela([partida]);
      exibirMensagem(`Partida #${partida.id} localizada com sucesso no banco SQLite!`, 'sucesso');
    } catch (erro) {
      console.error(`Erro ao consultar partida #${id}:`, erro);
      exibirMensagem(`Erro ao consultar partida #${id}: ${erro.message}`, 'erro');
    } finally {
      exibirCarregando(false);
    }
  }

  /**
   * Trata a submissão do formulário (POST para criar ou PUT para atualizar)
   */
  async function lidarSubmissaoFormulario(event) {
    event.preventDefault();

    const jogadorBrancas = inputBrancas.value.trim();
    const jogadorPretas = inputPretas.value.trim();
    const resultado = selectResultado.value;
    const status = selectStatus.value;

    // Validação nos campos obrigatórios
    if (!jogadorBrancas || !jogadorPretas || !resultado || !status) {
      exibirMensagem('Por favor, preencha todos os campos obrigatórios (*).', 'erro');
      marcarCamposInvalidos({ jogadorBrancas, jogadorPretas, resultado, status });
      return;
    }

    removerMarcacoesInvalidas();

    const payload = {
      jogadorBrancas,
      jogadorPretas,
      resultado,
      status
    };

    desabilitarFormulario(true);

    try {
      if (partidaEmEdicaoId !== null) {
        // PUT /api/partidas/{id}
        await atualizarPartidaAPI(partidaEmEdicaoId, payload);
      } else {
        // POST /api/partidas
        await cadastrarPartidaAPI(payload);
      }
    } catch (erro) {
      console.error('Erro na operação com o formulário:', erro);
      exibirMensagem(`Erro na operação: ${erro.message}`, 'erro');
    } finally {
      desabilitarFormulario(false);
    }
  }

  /**
   * POST /api/partidas - Cadastra nova partida no SQLite
   */
  async function cadastrarPartidaAPI(payload) {
    const response = await fetch(ENDPOINT_PARTIDAS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok && response.status !== 201) {
      throw new Error(`Falha ao cadastrar partida (HTTP ${response.status})`);
    }

    const novaPartida = await response.json();
    exibirMensagem(`Partida #${novaPartida.id} salva com sucesso no banco de dados SQLite!`, 'sucesso');

    limparECancelarEdicao();
    await carregarPartidasAPI();
  }

  /**
   * PUT /api/partidas/{id} - Atualiza partida existente no SQLite
   */
  async function atualizarPartidaAPI(id, payload) {
    const response = await fetch(`${ENDPOINT_PARTIDAS}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 404) {
      throw new Error(`Partida #${id} não encontrada no banco SQLite para atualização.`);
    }

    if (!response.ok) {
      throw new Error(`Falha ao atualizar partida (HTTP ${response.status})`);
    }

    const partidaAtualizada = await response.json();
    exibirMensagem(`Partida #${partidaAtualizada.id} atualizada com sucesso no banco SQLite!`, 'sucesso');

    limparECancelarEdicao();
    await carregarPartidasAPI();
  }

  /**
   * DELETE /api/partidas/{id} - Remove partida do SQLite
   */
  async function confirmarExclusao(id) {
    const partida = partidasAtuais.find(p => p.id === id);
    const descricao = partida ? ` (${partida.jogadorBrancas} vs ${partida.jogadorPretas})` : '';

    const confirmou = window.confirm(
      `Deseja realmente excluir a partida #${id}${descricao} permanentemente do banco SQLite?`
    );

    if (!confirmou) return;

    exibirCarregando(true);

    try {
      const response = await fetch(`${ENDPOINT_PARTIDAS}/${id}`, {
        method: 'DELETE'
      });

      if (response.status === 404) {
        throw new Error(`Partida #${id} não encontrada no banco SQLite.`);
      }

      if (!response.ok && response.status !== 204) {
        throw new Error(`Falha ao excluir partida (HTTP ${response.status})`);
      }

      exibirMensagem(`Partida #${id} excluída permanentemente do banco SQLite!`, 'sucesso');

      if (partidaEmEdicaoId === id) {
        limparECancelarEdicao();
      }

      await carregarPartidasAPI();
    } catch (erro) {
      console.error(`Erro ao excluir partida #${id}:`, erro);
      exibirMensagem(`Erro ao excluir partida: ${erro.message}`, 'erro');
    } finally {
      exibirCarregando(false);
    }
  }

  /**
   * =========================================================================
   * MANIPULAÇÃO VISUAL E RENDERIZAÇÃO
   * =========================================================================
   */

  /**
   * Prepara o formulário para edição da partida selecionada
   */
  async function iniciarEdicao(id) {
    try {
      // Busca os dados mais recentes diretamente do banco para garantir integridade
      const response = await fetch(`${ENDPOINT_PARTIDAS}/${id}`);
      if (!response.ok) {
        throw new Error(`Partida #${id} não encontrada no banco.`);
      }

      const partida = await response.json();

      partidaEmEdicaoId = partida.id;
      inputId.value = partida.id;
      inputBrancas.value = partida.jogadorBrancas;
      inputPretas.value = partida.jogadorPretas;
      selectResultado.value = partida.resultado;
      selectStatus.value = partida.status;

      // Atualiza os elementos visuais do formulário
      formHeading.textContent = `Editar Partida #${partida.id}`;
      formModeBadge.textContent = 'Modo Edição';
      formModeBadge.className = 'badge badge-editando';

      btnSubmitText.textContent = 'Salvar Alterações';
      btnSubmitIcon.textContent = '✔';
      btnCancelar.textContent = 'Cancelar Edição';

      removerMarcacoesInvalidas();
      renderizarTabela(filtroIdAtivo ? [partida] : partidasAtuais);

      inputBrancas.focus();
      exibirMensagem(`Carregados os dados da partida #${partida.id} do banco para edição.`, 'info');
    } catch (erro) {
      exibirMensagem(`Não foi possível carregar os dados da partida para edição: ${erro.message}`, 'erro');
    }
  }

  /**
   * Limpa o formulário e retorna ao modo de cadastro
   */
  function limparECancelarEdicao() {
    partidaEmEdicaoId = null;
    formPartida.reset();
    inputId.value = '';

    formHeading.textContent = 'Cadastrar Nova Partida';
    formModeBadge.textContent = 'Novo Registro';
    formModeBadge.className = 'badge badge-novo';

    btnSubmitText.textContent = 'Cadastrar Partida';
    btnSubmitIcon.textContent = '✚';
    btnCancelar.textContent = 'Limpar Formulário';

    removerMarcacoesInvalidas();
    renderizarTabela(filtroIdAtivo ? partidasAtuais.filter(p => p.id === filtroIdAtivo) : partidasAtuais);
  }

  /**
   * Renderiza a lista de partidas na tabela
   */
  function renderizarTabela(lista, msgTitulo, msgAjuda) {
    tabelaCorpo.innerHTML = '';

    const total = lista.length;
    contadorPartidas.textContent = total === 1 ? '1 partida' : `${total} partidas`;

    if (total === 0) {
      tableContainer.hidden = true;
      emptyState.hidden = false;
      if (emptyStateTitle) emptyStateTitle.textContent = msgTitulo || 'Nenhuma partida encontrada no sistema.';
      if (emptyStateHelp) emptyStateHelp.textContent = msgAjuda || 'Utilize o formulário ao lado para cadastrar a primeira partida.';
      return;
    }

    tableContainer.hidden = false;
    emptyState.hidden = true;

    lista.forEach((partida) => {
      const tr = document.createElement('tr');
      if (partidaEmEdicaoId === partida.id) {
        tr.classList.add('row-selected');
      }

      tr.innerHTML = `
        <td class="col-id">${partida.id}</td>
        <td>
          <span class="player-name">
            <span class="player-piece" aria-hidden="true">♔</span>
            ${escaparHtml(partida.jogadorBrancas)}
          </span>
        </td>
        <td>
          <span class="player-name">
            <span class="player-piece" aria-hidden="true">♚</span>
            ${escaparHtml(partida.jogadorPretas)}
          </span>
        </td>
        <td class="col-res">${escaparHtml(partida.resultado)}</td>
        <td class="col-status">
          <span class="badge ${obterClasseStatus(partida.status)}">
            ${escaparHtml(partida.status)}
          </span>
        </td>
        <td class="col-acoes text-center">
          <div class="actions-cell">
            <button 
              type="button" 
              class="btn btn-sm btn-secondary" 
              data-action="edit" 
              data-id="${partida.id}"
              aria-label="Editar partida ${partida.id}"
            >
              Editar
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-danger" 
              data-action="delete" 
              data-id="${partida.id}"
              aria-label="Excluir partida ${partida.id}"
            >
              Excluir
            </button>
          </div>
        </td>
      `;

      tabelaCorpo.appendChild(tr);
    });
  }

  /**
   * Atualiza o badge de status da API no cabeçalho
   */
  function atualizarStatusAPI(conectado) {
    if (conectado) {
      apiStatusBadge.className = 'api-status-badge status-online';
      apiStatusText.textContent = 'SQLite Conectado';
    } else {
      apiStatusBadge.className = 'api-status-badge status-offline';
      apiStatusText.textContent = 'API Desconectada';
    }
  }

  /**
   * Controla o indicador de carregamento
   */
  function exibirCarregando(carregando) {
    if (loadingIndicator) {
      loadingIndicator.hidden = !carregando;
    }
    if (btnRecarregar) {
      btnRecarregar.disabled = carregando;
    }
  }

  function exibirErroConexao(mensagem) {
    if (connectionError) {
      connectionError.hidden = false;
      if (connectionErrorMsg) connectionErrorMsg.textContent = mensagem;
    }
    if (tableContainer) tableContainer.hidden = true;
    if (emptyState) emptyState.hidden = true;
  }

  function ocultarErroConexao() {
    if (connectionError) connectionError.hidden = true;
  }

  function desabilitarFormulario(desabilitado) {
    btnSubmit.disabled = desabilitado;
    btnCancelar.disabled = desabilitado;
    inputBrancas.disabled = desabilitado;
    inputPretas.disabled = desabilitado;
    selectResultado.disabled = desabilitado;
    selectStatus.disabled = desabilitado;

    if (desabilitado) {
      btnSubmitText.textContent = 'Gravando no banco...';
    } else {
      btnSubmitText.textContent = partidaEmEdicaoId !== null ? 'Salvar Alterações' : 'Cadastrar Partida';
    }
  }

  /**
   * Exibição de alertas dinâmicos
   */
  function exibirMensagem(texto, tipo = 'info') {
    if (feedbackTimeout) {
      clearTimeout(feedbackTimeout);
    }

    const tipoClasses = {
      sucesso: 'alert-success',
      erro: 'alert-error',
      info: 'alert-info'
    };

    const classeAlerta = tipoClasses[tipo] || 'alert-info';

    feedbackArea.innerHTML = `
      <div class="alert ${classeAlerta}" role="alert">
        <span>${escaparHtml(texto)}</span>
        <button type="button" class="alert-close" aria-label="Fechar mensagem">&times;</button>
      </div>
    `;

    const closeBtn = feedbackArea.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        feedbackArea.innerHTML = '';
      });
    }

    feedbackTimeout = setTimeout(() => {
      feedbackArea.innerHTML = '';
    }, 6000);
  }

  function marcarCamposInvalidos(valores) {
    if (!valores.jogadorBrancas) inputBrancas.classList.add('input-invalid');
    if (!valores.jogadorPretas) inputPretas.classList.add('input-invalid');
    if (!valores.resultado) selectResultado.classList.add('input-invalid');
    if (!valores.status) selectStatus.classList.add('input-invalid');
  }

  function removerMarcacoesInvalidas() {
    [inputBrancas, inputPretas, selectResultado, selectStatus].forEach((el) => {
      if (el) el.classList.remove('input-invalid');
    });
  }

  function obterClasseStatus(status) {
    switch (status) {
      case 'Finalizada':
        return 'status-finalizada';
      case 'Em andamento':
        return 'status-andamento';
      case 'Pendente':
        return 'status-pendente';
      case 'Interrompida':
        return 'status-interrompida';
      default:
        return 'badge-info';
    }
  }

  function escaparHtml(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
