/**
 * ==========================================================================
 * Arena Xadrez - Interface de Demonstração (JavaScript Puro)
 * 
 * ATENÇÃO:
 * - Esta aplicação opera em modo de demonstração isolado.
 * - Todos os dados são simulados em memória no navegador.
 * - NENHUMA conexão de rede / requisição HTTP é feita com o backend/API.
 * ==========================================================================
 */

'use strict';

(function () {
  // Dados fictícios iniciais para a demonstração
  const DADOS_INICIAIS = [
    {
      id: 1,
      jogadorBrancas: "Magnus Carlsen",
      jogadorPretas: "Hikaru Nakamura",
      resultado: "1-0",
      status: "Finalizada"
    },
    {
      id: 2,
      jogadorBrancas: "Fabiano Caruana",
      jogadorPretas: "Ian Nepomniachtchi",
      resultado: "0-1",
      status: "Finalizada"
    },
    {
      id: 3,
      jogadorBrancas: "Ding Liren",
      jogadorPretas: "Gukesh D",
      resultado: "1/2-1/2",
      status: "Finalizada"
    },
    {
      id: 4,
      jogadorBrancas: "Alireza Firouzja",
      jogadorPretas: "Praggnanandhaa R",
      resultado: "*",
      status: "Em andamento"
    }
  ];

  // Estado local em memória (mutável durante a sessão)
  let partidas = JSON.parse(JSON.stringify(DADOS_INICIAIS));
  let partidaEmEdicaoId = null;

  // Elementos do DOM
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
  let emptyState;
  let contadorPartidas;
  let feedbackArea;
  let btnRestaurar;
  let btnEmptyRestore;

  let feedbackTimeout = null;

  /**
   * Inicialização do ciclo de vida da interface
   */
  document.addEventListener('DOMContentLoaded', () => {
    mapearElementosDOM();
    vincularEventos();
    renderizarTabela();
    exibirMensagem('Interface de demonstração carregada com dados locais simulados.', 'info');
  });

  /**
   * Mapeamento de referências do DOM
   */
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
    emptyState = document.getElementById('empty-state');
    contadorPartidas = document.getElementById('contador-partidas');
    feedbackArea = document.getElementById('feedback-area');

    btnRestaurar = document.getElementById('btn-restaurar-dados');
    btnEmptyRestore = document.getElementById('btn-empty-restore');
  }

  /**
   * Registro de eventos do usuário
   */
  function vincularEventos() {
    formPartida.addEventListener('submit', lidarSubmissaoFormulario);
    btnCancelar.addEventListener('click', limparECancelarEdicao);

    if (btnRestaurar) {
      btnRestaurar.addEventListener('click', restaurarDadosIniciais);
    }
    if (btnEmptyRestore) {
      btnEmptyRestore.addEventListener('click', restaurarDadosIniciais);
    }

    // Delegação de eventos para botões da tabela (Editar / Excluir)
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
   * Renderiza a lista de partidas na tabela
   */
  function renderizarTabela() {
    tabelaCorpo.innerHTML = '';

    const total = partidas.length;
    contadorPartidas.textContent = total === 1 ? '1 partida' : `${total} partidas`;

    if (total === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    partidas.forEach((partida) => {
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
              aria-label="Visualizar e editar partida ${partida.id}"
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
   * Trata o envio do formulário (Criação ou Atualização)
   */
  function lidarSubmissaoFormulario(event) {
    event.preventDefault();

    const jogadorBrancas = inputBrancas.value.trim();
    const jogadorPretas = inputPretas.value.trim();
    const resultado = selectResultado.value;
    const status = selectStatus.value;

    // Validações básicas visuais
    if (!jogadorBrancas || !jogadorPretas || !resultado || !status) {
      exibirMensagem('Por favor, preencha todos os campos obrigatórios.', 'erro');
      marcarCamposInvalidos({ jogadorBrancas, jogadorPretas, resultado, status });
      return;
    }

    removerMarcacoesInvalidas();

    if (partidaEmEdicaoId !== null) {
      // Atualização
      const indice = partidas.findIndex(p => p.id === partidaEmEdicaoId);
      if (indice !== -1) {
        partidas[indice] = {
          id: partidaEmEdicaoId,
          jogadorBrancas,
          jogadorPretas,
          resultado,
          status
        };

        exibirMensagem(`Partida #${partidaEmEdicaoId} atualizada com sucesso no estado local.`, 'sucesso');
      }
    } else {
      // Inclusão de nova partida com ID auto-incrementado simulado
      const proximoId = partidas.length > 0 ? Math.max(...partidas.map(p => p.id)) + 1 : 1;

      const novaPartida = {
        id: proximoId,
        jogadorBrancas,
        jogadorPretas,
        resultado,
        status
      };

      partidas.push(novaPartida);
      exibirMensagem(`Nova partida #${proximoId} adicionada com sucesso no estado local.`, 'sucesso');
    }

    limparECancelarEdicao();
    renderizarTabela();
  }

  /**
   * Prepara o formulário para edição da partida selecionada
   */
  function iniciarEdicao(id) {
    const partida = partidas.find(p => p.id === id);
    if (!partida) {
      exibirMensagem(`Partida #${id} não encontrada.`, 'erro');
      return;
    }

    partidaEmEdicaoId = partida.id;
    inputId.value = partida.id;
    inputBrancas.value = partida.jogadorBrancas;
    inputPretas.value = partida.jogadorPretas;
    selectResultado.value = partida.resultado;
    selectStatus.value = partida.status;

    // Ajusta a interface visual para modo de edição
    formHeading.textContent = `Editar Partida #${partida.id}`;
    formModeBadge.textContent = 'Modo Edição';
    formModeBadge.className = 'badge badge-editando';

    btnSubmitText.textContent = 'Salvar Alterações';
    btnSubmitIcon.textContent = '✔';
    btnCancelar.textContent = 'Cancelar Edição';

    removerMarcacoesInvalidas();
    renderizarTabela();

    inputBrancas.focus();
    exibirMensagem(`Carregados os dados da partida #${partida.id} para edição visual.`, 'info');
  }

  /**
   * Exclusão da partida no estado local
   */
  function confirmarExclusao(id) {
    const partida = partidas.find(p => p.id === id);
    if (!partida) return;

    const confirmou = window.confirm(
      `Deseja realmente remover a partida #${id} (${partida.jogadorBrancas} vs ${partida.jogadorPretas}) da demonstração local?`
    );

    if (!confirmou) return;

    partidas = partidas.filter(p => p.id !== id);

    // Se estiver editando a mesma partida que foi excluída, limpa o formulário
    if (partidaEmEdicaoId === id) {
      limparECancelarEdicao();
    }

    renderizarTabela();
    exibirMensagem(`Partida #${id} removida com sucesso do estado local.`, 'sucesso');
  }

  /**
   * Retorna o formulário ao modo de cadastro inicial
   */
  function limparECancelarEdicao() {
    partidaEmEdicaoId = null;
    formPartida.reset();
    inputId.value = '';

    formHeading.textContent = 'Cadastrar Nova Partida';
    formModeBadge.textContent = 'Novo Registro';
    formModeBadge.className = 'badge badge-novo';

    btnSubmitText.textContent = 'Adicionar Partida';
    btnSubmitIcon.textContent = '✚';
    btnCancelar.textContent = 'Limpar Formulário';

    removerMarcacoesInvalidas();
    renderizarTabela();
  }

  /**
   * Restaura os dados iniciais pré-definidos
   */
  function restaurarDadosIniciais() {
    partidas = JSON.parse(JSON.stringify(DADOS_INICIAIS));
    limparECancelarEdicao();
    renderizarTabela();
    exibirMensagem('Dados de exemplo restaurados com sucesso.', 'info');
  }

  /**
   * Exibe mensagens de feedback com suporte a leitores de tela
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

    // Ocultar automaticamente após 6 segundos
    feedbackTimeout = setTimeout(() => {
      feedbackArea.innerHTML = '';
    }, 6000);
  }

  /**
   * Marcação de campos com erro visual
   */
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

  /**
   * Mapeamento de classe CSS para badge de status
   */
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

  /**
   * Prevenção de XSS simples para renderização segura
   */
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
