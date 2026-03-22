/* =========================================================
   SCRIPT PRINCIPAL DO PROJETO - BARBEARIA
   =========================================================
   FUNCIONA NAS PÁGINAS:
   - index.html
   - cadastro.html
   - agendamento.html

   ORGANIZAÇÃO:
   1) CONFIGURAÇÕES PADRÃO
   2) FUNÇÕES UTILITÁRIAS
   3) LOGIN
   4) CADASTRO
   5) AGENDAMENTO DO CLIENTE
   6) INICIALIZAÇÃO GERAL
   ========================================================= */


/* =========================================================
   1) CONFIGURAÇÕES PADRÃO (FICTÍCIAS)
   ========================================================= */
const CONFIG_PADRAO = {
  nomeSalao: "Barbearia Elite",

  // Funcionamento por dia
  funcionamento: {
    segSex: {
      label: "Ter a Sex",
      inicio: "09:00",
      fim: "19:00"
    },
    sab: {
      label: "Sáb",
      inicio: "09:00",
      fim: "13:00"
    }
  },

  // Barbeiros fictícios
  barbeiros: [
    {
      id: 1,
      nome: "João Victor",
      foto: "",
      descricao: "",
      ordem: 1
    },
    {
      id: 2,
      nome: "Carlos Henrique",
      foto: "",
      descricao: "",
      ordem: 2
    },
    {
      id: 3,
      nome: "Michael Santos",
      foto: "",
      descricao: "Especialista em cortes infantis.",
      ordem: 3
    },
    {
      id: 4,
      nome: "Rafael Lima",
      foto: "",
      descricao: "",
      ordem: 4
    }
  ],

  // Serviços fictícios
  servicos: [
    {
      id: 1,
      nome: "Corte",
      tempo: 30,
      preco: 35,
      ordem: 1
    },
    {
      id: 2,
      nome: "Barba",
      tempo: 20,
      preco: 25,
      ordem: 2
    },
    {
      id: 3,
      nome: "Combo",
      tempo: 50,
      preco: 55,
      ordem: 3
    },
    {
      id: 4,
      nome: "Sobrancelha",
      tempo: 15,
      preco: 15,
      ordem: 4
    }
  ]
};


/* =========================================================
   AGENDAMENTOS FICTÍCIOS PADRÃO
   ========================================================= */
const AGENDAMENTOS_PADRAO = [
  {
    data: "2026-03-23",
    barbeiroId: 1,
    servicoId: 1,
    inicio: "09:00",
    fim: "09:30",
    cliente: "Cliente Teste Front-End"
  },
  {
    data: "2026-03-23",
    barbeiroId: 1,
    servicoId: 3,
    inicio: "10:00",
    fim: "10:50",
    cliente: "Cliente Teste 2"
  },
  {
    data: "2026-03-23",
    barbeiroId: 2,
    servicoId: 2,
    inicio: "14:00",
    fim: "14:20",
    cliente: "Cliente Teste 3"
  }
];


/* =========================================================
   ESTADO DA TELA
   ========================================================= */
let estadoAgendamento = {
  servicoSelecionado: null,
  barbeiroSelecionado: null,
  horarioSelecionado: null,
  abaAtiva: "agendar"
};


/* =========================================================
   2) FUNÇÕES UTILITÁRIAS
   ========================================================= */

/* Lê configuração do salão */
function obterConfigSalao() {
  const configSalva = localStorage.getItem("barbearia_config");

  if (configSalva) {
    const configParse = JSON.parse(configSalva);

    // Faz merge da config salva com a padrão
    // Assim, se faltar "sab" ou "domSeg", ele completa automaticamente
    return {
      ...CONFIG_PADRAO,
      ...configParse,
      funcionamento: {
        ...CONFIG_PADRAO.funcionamento,
        ...(configParse.funcionamento || {})
      }
    };
  }

  localStorage.setItem("barbearia_config", JSON.stringify(CONFIG_PADRAO));
  return CONFIG_PADRAO;
}

/* Lê agendamentos */
function obterAgendamentos() {
  const agendamentosSalvos = localStorage.getItem("barbearia_agendamentos");

  if (agendamentosSalvos) {
    return JSON.parse(agendamentosSalvos);
  }

  localStorage.setItem("barbearia_agendamentos", JSON.stringify(AGENDAMENTOS_PADRAO));
  return AGENDAMENTOS_PADRAO;
}

/* Salva agendamentos */
function salvarAgendamentos(lista) {
  localStorage.setItem("barbearia_agendamentos", JSON.stringify(lista));
}

/* Formata moeda */
function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

/* HH:MM => minutos */
function horaParaMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/* minutos => HH:MM */
function minutosParaHora(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/* Formata data */
function formatarDataBR(dataISO) {
  if (!dataISO) return "Não selecionada";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

/* Busca serviço */
function obterServicoPorId(id) {
  const config = obterConfigSalao();
  return config.servicos.find(servico => servico.id === id) || null;
}

/* Busca barbeiro */
function obterBarbeiroPorId(id) {
  const config = obterConfigSalao();
  return config.barbeiros.find(barbeiro => barbeiro.id === id) || null;
}

/* Atualiza nome do salão global */
function aplicarNomeSalaoGlobal() {
  const config = obterConfigSalao();

  document.querySelectorAll("[data-nome-salao]").forEach(el => {
    el.textContent = config.nomeSalao;
  });

  const nomeSalaoTopo = document.getElementById("nomeSalaoTopo");
  const nomeSalaoSidebar = document.getElementById("nomeSalaoSidebar");

  if (nomeSalaoTopo) nomeSalaoTopo.textContent = config.nomeSalao;
  if (nomeSalaoSidebar) nomeSalaoSidebar.textContent = config.nomeSalao;
}

/* Cliente logado fake */
function obterClienteLogado() {
  const clienteSalvo = localStorage.getItem("barbearia_cliente_logado");

  if (clienteSalvo) {
    return JSON.parse(clienteSalvo);
  }

  const clienteFake = {
    nome: "Cliente Teste Front-End"
  };

  localStorage.setItem("barbearia_cliente_logado", JSON.stringify(clienteFake));
  return clienteFake;
}

/* Ordena barbeiros */
function obterBarbeirosOrdenados() {
  const config = obterConfigSalao();
  return [...config.barbeiros].sort((a, b) => (a.ordem || 999) - (b.ordem || 999));
}

/* Ordena serviços */
function obterServicosOrdenados() {
  const config = obterConfigSalao();
  return [...config.servicos].sort((a, b) => (a.ordem || 999) - (b.ordem || 999));
}

/* Texto dos chips de funcionamento */
function obterFuncionamentoEmLista() {
  const config = obterConfigSalao();

  if (!config.funcionamento) {
    return [
      {
        label: "Ter a Sex",
        texto: `${config.abertura || "09:00"} às ${config.fechamento || "19:00"}`
      }
    ];
  }

  const lista = [];

  if (config.funcionamento.segSex) {
    if (config.funcionamento.segSex.fechado) {
      lista.push({
        label: config.funcionamento.segSex.label || "Ter a Sex",
        texto: "Fechado"
      });
    } else {
      lista.push({
        label: config.funcionamento.segSex.label || "Ter a Sex",
        texto: `${config.funcionamento.segSex.inicio} às ${config.funcionamento.segSex.fim}`
      });
    }
  }

  if (config.funcionamento.sab) {
    if (config.funcionamento.sab.fechado) {
      lista.push({
        label: config.funcionamento.sab.label || "Sáb",
        texto: "Fechado"
      });
    } else {
      lista.push({
        label: config.funcionamento.sab.label || "Sáb",
        texto: `${config.funcionamento.sab.inicio} às ${config.funcionamento.sab.fim}`
      });
    }
  }

  if (config.funcionamento.dom) {
    if (config.funcionamento.dom.fechado) {
      lista.push({
        label: config.funcionamento.dom.label || "Dom",
        texto: "Fechado"
      });
    } else {
      lista.push({
        label: config.funcionamento.dom.label || "Dom",
        texto: `${config.funcionamento.dom.inicio} às ${config.funcionamento.dom.fim}`
      });
    }
  }

  return lista;
}

/* Retorna expediente com base na data */
function obterExpedientePorData(dataISO) {
  const config = obterConfigSalao();

  if (!config.funcionamento) {
    return {
      fechado: false,
      inicio: config.abertura || "09:00",
      fim: config.fechamento || "19:00"
    };
  }

  const data = new Date(`${dataISO}T12:00:00`);
  const diaSemana = data.getDay(); // 0=dom / 6=sab

  if (diaSemana === 0) {
    return config.funcionamento.dom || { fechado: true };
  }

  if (diaSemana === 6) {
    return config.funcionamento.sab || { fechado: true };
  }

  return config.funcionamento.segSex || { fechado: true };
}

/* Toast amigável */
function mostrarToastAmigavel(mensagem) {
  const toastExistente = document.querySelector(".toast-amigavel");
  if (toastExistente) {
    toastExistente.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast-amigavel";
  toast.innerHTML = mensagem;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

/* Controle de carrossel */
function iniciarControleCarrossel(containerId, prevId, nextId) {
  const container = document.getElementById(containerId);
  const btnPrev = document.getElementById(prevId);
  const btnNext = document.getElementById(nextId);

  if (!container || !btnPrev || !btnNext) return;

  btnPrev.addEventListener("click", function () {
    container.scrollBy({
      left: -180,
      behavior: "smooth"
    });
  });

  btnNext.addEventListener("click", function () {
    container.scrollBy({
      left: 180,
      behavior: "smooth"
    });
  });
}


/* =========================================================
   3) LOGIN
   ========================================================= */
function iniciarLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const user = document.getElementById("usuario")?.value.trim();
    const pass = document.getElementById("senha")?.value.trim();

    if (user === "admin" && pass === "123") {
      alert("Login OK");
    } else {
      alert("Usuário ou senha incorretos");
    }
  });

  const btnTeste = document.getElementById("btnTeste");
  if (btnTeste) {
    btnTeste.addEventListener("click", function () {
      window.location.href = "pages/agendamento.html";
    });
  }
}


/* =========================================================
   4) CADASTRO
   ========================================================= */
function iniciarCadastro() {
  const formCadastro = document.getElementById("cadastroForm");
  if (!formCadastro) return;

  const inputWhats = document.getElementById("whatsapp");

  if (inputWhats) {
    inputWhats.addEventListener("focus", function () {
      if (this.value === "") {
        this.value = "(";
      }
    });

    inputWhats.addEventListener("input", function (e) {
      let valor = e.target.value.replace(/\D/g, "");
      valor = valor.substring(0, 11);

      let formatado = "";

      if (valor.length > 0) {
        formatado = "(" + valor.substring(0, 2);
      }

      if (valor.length >= 3) {
        formatado += ") " + valor.substring(2, 7);
      }

      if (valor.length >= 8) {
        formatado += "-" + valor.substring(7, 11);
      }

      e.target.value = formatado;
    });
  }

  if (window.flatpickr) {
    flatpickr("#dataNascimento", {
      dateFormat: "d/m/Y",
      locale: "pt",
      maxDate: "today"
    });
  }

  formCadastro.addEventListener("submit", function (e) {
    e.preventDefault();

    const s1 = document.getElementById("senha1")?.value;
    const s2 = document.getElementById("senha2")?.value;
    const erro = document.getElementById("erroSenha");

    if (!erro) return;

    if (s1 !== s2) {
      erro.style.display = "block";
      return;
    }

    erro.style.display = "none";
    alert("Cadastro realizado com sucesso!");
  });
}


/* =========================================================
   5) AGENDAMENTO DO CLIENTE
   ========================================================= */
function iniciarAgendamento() {
  const paginaAgendamento = document.getElementById("agendamentoPage");
  if (!paginaAgendamento) return;

  const inputData = document.getElementById("dataAgendamento");

  aplicarCabecalhoSistemaCliente();
  renderizarFuncionamentoChips();

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  const hojeISO = `${ano}-${mes}-${dia}`;

  if (inputData) {
    inputData.min = hojeISO;
    inputData.value = hojeISO;
  }

  renderizarMenuCliente();
  renderizarServicosAgendamento();
  renderizarBarbeirosSistema();
  renderizarCatalogoServicos();
  renderizarMeusAgendamentos();
  atualizarResumoSistemaCliente();

  iniciarControleCarrossel("servicosAgendamento", "btnServicosPrev", "btnServicosNext");
  iniciarControleCarrossel("barbeirosSistema", "btnBarbeirosPrev", "btnBarbeirosNext");

  if (inputData) {
    inputData.addEventListener("change", function () {
      estadoAgendamento.horarioSelecionado = null;
      atualizarResumoSistemaCliente();
      gerarHorariosSistema();
    });
  }

  const btnAgendar = document.getElementById("btnAgendar");
  if (btnAgendar) {
    btnAgendar.addEventListener("click", confirmarAgendamentoSistema);
  }
}

/* Cabeçalho */
function aplicarCabecalhoSistemaCliente() {
  const config = obterConfigSalao();
  const nomeSalaoTopo = document.getElementById("nomeSalaoTopo");
  const nomeSalaoSidebar = document.getElementById("nomeSalaoSidebar");

  if (nomeSalaoTopo) nomeSalaoTopo.textContent = config.nomeSalao;
  if (nomeSalaoSidebar) nomeSalaoSidebar.textContent = config.nomeSalao;

  document.title = `${config.nomeSalao} | Área do Cliente`;
}

/* Chips de funcionamento */
function renderizarFuncionamentoChips() {
  const container = document.getElementById("funcionamentoChips");
  if (!container) return;

  const lista = obterFuncionamentoEmLista();
  container.innerHTML = "";

  lista.forEach(item => {
    const chip = document.createElement("div");
    chip.className = "func-chip";
    chip.innerHTML = `
      <i class="fa-regular fa-clock"></i>
      <span><strong>${item.label}</strong> · ${item.texto}</span>
    `;
    container.appendChild(chip);
  });
}

/* Menu lateral */
function renderizarMenuCliente() {
  const botoesMenu = document.querySelectorAll(".menu-item");

  botoesMenu.forEach(botao => {
    botao.addEventListener("click", function () {
      const aba = botao.getAttribute("data-aba");
      trocarAbaCliente(aba);
    });
  });
}

/* Troca de abas */
function trocarAbaCliente(nomeAba) {
  estadoAgendamento.abaAtiva = nomeAba;

  document.querySelectorAll(".menu-item").forEach(item => {
    item.classList.remove("ativo");
  });

  const botaoAtivo = document.querySelector(`.menu-item[data-aba="${nomeAba}"]`);
  if (botaoAtivo) botaoAtivo.classList.add("ativo");

  document.querySelectorAll(".cliente-aba").forEach(aba => {
    aba.classList.remove("ativa");
  });

  const abaAlvo = document.getElementById(`aba-${nomeAba}`);
  if (abaAlvo) abaAlvo.classList.add("ativa");

  // Manual e resumo só existem visualmente na aba agendar
  const manual = document.getElementById("manualInlineAgendar");
  const resumo = document.getElementById("resumoAgendarCard");

  if (manual) {
    manual.style.display = nomeAba === "agendar" ? "flex" : "none";
  }

  if (resumo) {
    resumo.style.display = nomeAba === "agendar" ? "block" : "none";
  }

  if (nomeAba === "meusAgendamentos") {
    renderizarMeusAgendamentos();
  }

  if (nomeAba === "servicos") {
    renderizarCatalogoServicos();
  }
}

/* Renderiza serviços - passo 1 */
function renderizarServicosAgendamento() {
  const container = document.getElementById("servicosAgendamento");
  if (!container) return;

  const servicos = obterServicosOrdenados();
  container.innerHTML = "";

  servicos.forEach(servico => {
    const card = document.createElement("div");
    card.className = "servico-compact-card";

    card.innerHTML = `
      <div>
        <h3>${servico.nome}</h3>
      </div>

      <div class="servico-compact-meta">
        <span class="servico-compact-tempo">${servico.tempo} min</span>
        <span class="servico-compact-preco">${formatarMoeda(servico.preco)}</span>
      </div>
    `;

    card.addEventListener("click", function () {
  // Se clicar no mesmo serviço já selecionado, desmarca tudo
  if (estadoAgendamento.servicoSelecionado === servico.id) {
    estadoAgendamento.servicoSelecionado = null;
    estadoAgendamento.barbeiroSelecionado = null;
    estadoAgendamento.horarioSelecionado = null;

    // Remove seleção visual dos serviços
    document.querySelectorAll(".servico-compact-card").forEach(item => {
      item.classList.remove("ativo");
    });

    // Remove seleção visual dos barbeiros
    document.querySelectorAll(".barbeiro-compact-card").forEach(item => {
      item.classList.remove("ativo");
    });

    // Limpa label do barbeiro
    const barbeiroAgendaLabel = document.getElementById("barbeiroAgendaLabel");
    if (barbeiroAgendaLabel) {
      barbeiroAgendaLabel.textContent = "Nenhum selecionado";
    }

    // Limpa horários
    const horarios = document.getElementById("horariosSistema");
    if (horarios) {
      horarios.innerHTML = "";
    }

    // Mensagem amigável
    const mensagemAgenda = document.getElementById("mensagemAgenda");
    if (mensagemAgenda) {
      mensagemAgenda.textContent = "Serviço desmarcado. Escolha novamente um serviço para continuar.";
    }

    atualizarResumoSistemaCliente();
    return;
  }

  // Remove seleção anterior dos serviços
  document.querySelectorAll(".servico-compact-card").forEach(item => {
    item.classList.remove("ativo");
  });

  // Sempre que trocar serviço:
  // - salva o serviço
  // - limpa barbeiro e horário para respeitar a ordem do fluxo
  estadoAgendamento.servicoSelecionado = servico.id;
  estadoAgendamento.barbeiroSelecionado = null;
  estadoAgendamento.horarioSelecionado = null;

  card.classList.add("ativo");

  // Limpa seleção visual dos barbeiros
  document.querySelectorAll(".barbeiro-compact-card").forEach(item => {
    item.classList.remove("ativo");
  });

  const barbeiroAgendaLabel = document.getElementById("barbeiroAgendaLabel");
  if (barbeiroAgendaLabel) {
    barbeiroAgendaLabel.textContent = "Nenhum selecionado";
  }

  const horarios = document.getElementById("horariosSistema");
  if (horarios) {
    horarios.innerHTML = "";
  }

  const mensagemAgenda = document.getElementById("mensagemAgenda");
  if (mensagemAgenda) {
    mensagemAgenda.textContent = "Agora escolha um barbeiro para abrir a agenda disponível.";
  }

  atualizarResumoSistemaCliente();
});

    container.appendChild(card);
  });
}

/* Renderiza barbeiros - passo 2 */
function renderizarBarbeirosSistema() {
  const container = document.getElementById("barbeirosSistema");
  if (!container) return;

  const barbeiros = obterBarbeirosOrdenados();
  container.innerHTML = "";

  barbeiros.forEach(barbeiro => {
    const card = document.createElement("div");
    card.className = "barbeiro-compact-card";

    const fotoHtml = barbeiro.foto
      ? `<img src="${barbeiro.foto}" alt="${barbeiro.nome}">`
      : `💈`;

    card.innerHTML = `
      <div class="barbeiro-foto-box">
        ${fotoHtml}
      </div>

      <h3>${barbeiro.nome}</h3>

      <p>${barbeiro.descricao ? barbeiro.descricao : "Disponível para os serviços do salão."}</p>
    `;

    card.addEventListener("click", function () {
      // PASSO OBRIGATÓRIO: primeiro serviço
      if (!estadoAgendamento.servicoSelecionado) {
        mostrarToastAmigavel(
          `<strong>Selecione o serviço primeiro 😊</strong><br>Assim eu consigo te mostrar a agenda certinha depois.`
        );
        return;
      }

      // Se clicar no mesmo barbeiro selecionado, desmarca
      if (estadoAgendamento.barbeiroSelecionado === barbeiro.id) {
        estadoAgendamento.barbeiroSelecionado = null;
        estadoAgendamento.horarioSelecionado = null;

        card.classList.remove("ativo");

        const barbeiroAgendaLabel = document.getElementById("barbeiroAgendaLabel");
        if (barbeiroAgendaLabel) {
          barbeiroAgendaLabel.textContent = "Nenhum selecionado";
        }

        const horarios = document.getElementById("horariosSistema");
        if (horarios) {
          horarios.innerHTML = "";
        }

        const mensagemAgenda = document.getElementById("mensagemAgenda");
        if (mensagemAgenda) {
          mensagemAgenda.textContent = "Barbeiro desmarcado. Escolha outro barbeiro para ver a agenda.";
        }

        atualizarResumoSistemaCliente();
        return;
      }

      document.querySelectorAll(".barbeiro-compact-card").forEach(item => {
        item.classList.remove("ativo");
      });

      card.classList.add("ativo");
      estadoAgendamento.barbeiroSelecionado = barbeiro.id;
      estadoAgendamento.horarioSelecionado = null;

      const barbeiroAgendaLabel = document.getElementById("barbeiroAgendaLabel");
      if (barbeiroAgendaLabel) {
        barbeiroAgendaLabel.textContent = barbeiro.nome;
      }

      atualizarResumoSistemaCliente();
      gerarHorariosSistema();
    });

    container.appendChild(card);
  });
}

/* Catálogo de serviços */
function renderizarCatalogoServicos() {
  const container = document.getElementById("catalogoServicos");
  if (!container) return;

  const servicos = obterServicosOrdenados();
  container.innerHTML = "";

  if (!servicos || servicos.length === 0) {
    container.innerHTML = `
      <div class="sem-agendamento">
        Nenhum serviço cadastrado pelo admin ainda.
      </div>
    `;
    return;
  }

  servicos.forEach(servico => {
    const card = document.createElement("div");
    card.className = "catalogo-servico-card";

    card.innerHTML = `
      <h3>${servico.nome}</h3>
      <p>Serviço disponível neste salão.</p>

      <div class="catalogo-servico-meta">
        <span class="tempo">${servico.tempo} min</span>
        <span class="preco">${formatarMoeda(servico.preco)}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

/* Gera agenda */
function gerarHorariosSistema() {
  const containerHorarios = document.getElementById("horariosSistema");
  const mensagemAgenda = document.getElementById("mensagemAgenda");
  const inputData = document.getElementById("dataAgendamento");

  if (!containerHorarios || !mensagemAgenda || !inputData) return;

  containerHorarios.innerHTML = "";

  if (!estadoAgendamento.servicoSelecionado) {
    mensagemAgenda.textContent = "Primeiro escolha um serviço para continuar.";
    return;
  }

  if (!estadoAgendamento.barbeiroSelecionado) {
    mensagemAgenda.textContent = "Agora escolha um barbeiro para abrir a agenda disponível.";
    return;
  }

  if (!inputData.value) {
    mensagemAgenda.textContent = "Selecione uma data para visualizar a agenda.";
    return;
  }

  const expediente = obterExpedientePorData(inputData.value);

  if (expediente.fechado) {
    mensagemAgenda.textContent = "O salão não funciona nesta data.";
    return;
  }

  const agendamentos = obterAgendamentos();
  const servico = obterServicoPorId(estadoAgendamento.servicoSelecionado);

  const aberturaMin = horaParaMinutos(expediente.inicio);
  const fechamentoMin = horaParaMinutos(expediente.fim);
  const duracaoServico = servico.tempo;

  const intervaloBase = 30;
  let totalHorarios = 0;

  for (let inicio = aberturaMin; inicio + duracaoServico <= fechamentoMin; inicio += intervaloBase) {
    const fim = inicio + duracaoServico;

    const inicioStr = minutosParaHora(inicio);
    const fimStr = minutosParaHora(fim);

    const disponivel = verificarDisponibilidade({
      data: inputData.value,
      barbeiroId: estadoAgendamento.barbeiroSelecionado,
      inicio: inicioStr,
      fim: fimStr,
      agendamentos
    });

    const btn = document.createElement("div");
    btn.className = "horario-system-btn";
    btn.textContent = inicioStr;

    if (!disponivel) {
      btn.classList.add("indisponivel");
      btn.title = "Horário indisponível";
    } else {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".horario-system-btn").forEach(item => {
          item.classList.remove("ativo");
        });

        btn.classList.add("ativo");
        estadoAgendamento.horarioSelecionado = inicioStr;

        atualizarResumoSistemaCliente();
      });
    }

    containerHorarios.appendChild(btn);
    totalHorarios++;
  }

  if (totalHorarios === 0) {
    mensagemAgenda.textContent = "Não há horários compatíveis com esse serviço nesta data.";
  } else {
    mensagemAgenda.textContent = "Escolha um horário disponível para finalizar seu agendamento.";
  }
}

/* Verifica conflito */
function verificarDisponibilidade({ data, barbeiroId, inicio, fim, agendamentos }) {
  const novoInicio = horaParaMinutos(inicio);
  const novoFim = horaParaMinutos(fim);

  const agendamentosDoMesmoDia = agendamentos.filter(item => {
    return item.data === data && item.barbeiroId === barbeiroId;
  });

  for (const ag of agendamentosDoMesmoDia) {
    const inicioAg = horaParaMinutos(ag.inicio);
    const fimAg = horaParaMinutos(ag.fim);

    const temConflito = novoInicio < fimAg && novoFim > inicioAg;

    if (temConflito) {
      return false;
    }
  }

  return true;
}

/* Atualiza resumo final bonito */
function atualizarResumoSistemaCliente() {
  const servico = obterServicoPorId(estadoAgendamento.servicoSelecionado);
  const barbeiro = obterBarbeiroPorId(estadoAgendamento.barbeiroSelecionado);
  const inputData = document.getElementById("dataAgendamento");
  const dataSelecionada = inputData ? inputData.value : "";
  const resumoStatusMensagem = document.getElementById("resumoStatusMensagem");

  const resumoBarbeiro = document.getElementById("resumoBarbeiro");
  const resumoServico = document.getElementById("resumoServico");
  const resumoData = document.getElementById("resumoData");
  const resumoHorario = document.getElementById("resumoHorario");
  const resumoTempo = document.getElementById("resumoTempo");
  const resumoPreco = document.getElementById("resumoPreco");

  if (resumoBarbeiro) {
    resumoBarbeiro.textContent = barbeiro ? barbeiro.nome : "Não selecionado";
  }

  if (resumoServico) {
    resumoServico.textContent = servico ? servico.nome : "Não selecionado";
  }

  if (resumoData) {
    resumoData.textContent = dataSelecionada ? formatarDataBR(dataSelecionada) : "Não selecionada";
  }

  if (resumoHorario) {
    resumoHorario.textContent = estadoAgendamento.horarioSelecionado || "Não selecionado";
  }

  if (resumoTempo) {
    resumoTempo.textContent = servico ? `${servico.tempo} min` : "--";
  }

  if (resumoPreco) {
    resumoPreco.textContent = servico ? formatarMoeda(servico.preco) : "R$ 0,00";
  }

  // Mensagem amigável conforme o passo atual
  if (!estadoAgendamento.servicoSelecionado) {
    resumoStatusMensagem.textContent = "Você ainda não escolheu o serviço. Esse é o primeiro passo.";
    return;
  }

  if (!estadoAgendamento.barbeiroSelecionado) {
    resumoStatusMensagem.textContent = "Perfeito! Agora escolha o barbeiro para abrir a agenda disponível.";
    return;
  }

  if (!estadoAgendamento.horarioSelecionado) {
    resumoStatusMensagem.textContent = "Quase lá! Agora selecione a data e um horário disponível.";
    return;
  }

  resumoStatusMensagem.textContent = "Tudo certo ✨ Confira os dados acima e confirme seu agendamento.";
}

/* Confirma agendamento */
function confirmarAgendamentoSistema() {
  const inputData = document.getElementById("dataAgendamento");
  const cliente = obterClienteLogado();

  if (!estadoAgendamento.servicoSelecionado) {
    mostrarToastAmigavel(
      `<strong>Escolha o serviço primeiro 😊</strong><br>Esse é o primeiro passo para continuar.`
    );
    return;
  }

  if (!estadoAgendamento.barbeiroSelecionado) {
    mostrarToastAmigavel(
      `<strong>Agora escolha o barbeiro ✂️</strong><br>Assim a agenda disponível será mostrada para você.`
    );
    return;
  }

  if (!inputData || !inputData.value) {
    mostrarToastAmigavel(
      `<strong>Selecione uma data 📅</strong><br>Escolha o dia em que deseja ser atendido.`
    );
    return;
  }

  if (!estadoAgendamento.horarioSelecionado) {
    mostrarToastAmigavel(
      `<strong>Falta só o horário ⏰</strong><br>Escolha um horário disponível para confirmar.`
    );
    return;
  }

  const servico = obterServicoPorId(estadoAgendamento.servicoSelecionado);
  const barbeiro = obterBarbeiroPorId(estadoAgendamento.barbeiroSelecionado);
  const agendamentos = obterAgendamentos();

  const inicioMin = horaParaMinutos(estadoAgendamento.horarioSelecionado);
  const fimMin = inicioMin + servico.tempo;

  const novoAgendamento = {
    data: inputData.value,
    barbeiroId: barbeiro.id,
    servicoId: servico.id,
    inicio: estadoAgendamento.horarioSelecionado,
    fim: minutosParaHora(fimMin),
    cliente: cliente.nome
  };

  const disponivel = verificarDisponibilidade({
    data: novoAgendamento.data,
    barbeiroId: novoAgendamento.barbeiroId,
    inicio: novoAgendamento.inicio,
    fim: novoAgendamento.fim,
    agendamentos
  });

  if (!disponivel) {
    mostrarToastAmigavel(
      `<strong>Ops! Esse horário ficou indisponível.</strong><br>Escolha outro horário para continuar.`
    );
    gerarHorariosSistema();
    return;
  }

  agendamentos.push(novoAgendamento);
  salvarAgendamentos(agendamentos);

  alert(
    `Agendamento confirmado!\n\n` +
    `Serviço: ${servico.nome}\n` +
    `Barbeiro: ${barbeiro.nome}\n` +
    `Data: ${formatarDataBR(novoAgendamento.data)}\n` +
    `Horário: ${novoAgendamento.inicio}`
  );

  estadoAgendamento.horarioSelecionado = null;

  atualizarResumoSistemaCliente();
  gerarHorariosSistema();
  renderizarMeusAgendamentos();

  trocarAbaCliente("meusAgendamentos");
}

/* Lista meus agendamentos */
function renderizarMeusAgendamentos() {
  const container = document.getElementById("listaMeusAgendamentos");
  if (!container) return;

  const cliente = obterClienteLogado();
  const agendamentos = obterAgendamentos();

  const meusAgendamentos = agendamentos.filter(item => item.cliente === cliente.nome);

  container.innerHTML = "";

  if (meusAgendamentos.length === 0) {
    container.innerHTML = `
      <div class="sem-agendamento">
        Você ainda não possui agendamentos cadastrados.
      </div>
    `;
    return;
  }

  meusAgendamentos.sort((a, b) => {
    const chaveA = `${a.data} ${a.inicio}`;
    const chaveB = `${b.data} ${b.inicio}`;
    return chaveA.localeCompare(chaveB);
  });

  meusAgendamentos.forEach(agendamento => {
    const barbeiro = obterBarbeiroPorId(agendamento.barbeiroId);
    const servico = obterServicoPorId(agendamento.servicoId);

    const card = document.createElement("div");
    card.className = "agendamento-cliente-card";

    card.innerHTML = `
      <div>
        <h3>${servico ? servico.nome : "Serviço removido"}</h3>

        <p>
          <strong>Barbeiro:</strong> ${barbeiro ? barbeiro.nome : "Barbeiro removido"}<br>
          <strong>Data:</strong> ${formatarDataBR(agendamento.data)}<br>
          <strong>Horário:</strong> ${agendamento.inicio} às ${agendamento.fim}
        </p>
      </div>

      <div class="tag-agendamento">Confirmado</div>
    `;

    container.appendChild(card);
  });
}

/* =========================================================
   MODAL DE SAÍDA DO SISTEMA
   =========================================================
   Este bloco:
   - cria o popup de sair
   - abre ao clicar no botão "Sair"
   - fecha no "Não"
   - sai para o login no "Sim"
   ========================================================= */

/* Cria o HTML do modal dinamicamente */
function criarModalSaidaSistema() {
  // Se já existir, não cria de novo
  if (document.getElementById("modalSairSistema")) return;

  const modal = document.createElement("div");
  modal.id = "modalSairSistema";
  modal.className = "modal-sair-overlay";

  modal.innerHTML = `
    <div class="modal-sair-box">
      <div class="modal-sair-icone">
        <i class="fa-solid fa-right-from-bracket"></i>
      </div>

      <h3>Deseja realmente sair?</h3>

      <p>
        Se você sair agora, será redirecionado para a tela de login
        e precisará iniciar novamente.
      </p>

      <div class="modal-sair-acoes">
        <button type="button" id="btnCancelarSaida" class="modal-sair-btn modal-sair-btn-nao">
          Não
        </button>

        <button type="button" id="btnConfirmarSaida" class="modal-sair-btn modal-sair-btn-sim">
          Sim
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  /* Fecha ao clicar fora da caixa */
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      fecharModalSaidaSistema();
      // Volta para a aba principal
      if (typeof trocarAbaCliente === "function") {
        trocarAbaCliente("agendar");
      }
    }
  });

  /* Botão NÃO */
  const btnCancelarSaida = document.getElementById("btnCancelarSaida");
  if (btnCancelarSaida) {
    btnCancelarSaida.addEventListener("click", function () {
      fecharModalSaidaSistema();

      // Se quiser, sempre volta para "Agendar horário"
      if (typeof trocarAbaCliente === "function") {
        trocarAbaCliente("agendar");
      }
    });
  }

  /* Botão SIM */
  const btnConfirmarSaida = document.getElementById("btnConfirmarSaida");
  if (btnConfirmarSaida) {
    btnConfirmarSaida.addEventListener("click", function () {
      // Fecha o modal
      fecharModalSaidaSistema();

      // Limpa apenas dados de sessão do cliente
      // NÃO apaga config do salão nem agendamentos
      localStorage.removeItem("barbearia_cliente_logado");
      sessionStorage.clear();

      // Redireciona para a tela de login
      window.location.href = "../index.html";
    });
  }
}

/* Abre o modal */
function abrirModalSaidaSistema() {
  const modal = document.getElementById("modalSairSistema");
  if (modal) {
    modal.classList.add("ativo");
  }
}

/* Fecha o modal */
function fecharModalSaidaSistema() {
  const modal = document.getElementById("modalSairSistema");
  if (modal) {
    modal.classList.remove("ativo");
  }
}

/* Inicializa o botão sair */
function iniciarBotaoSairSistema() {
  const btnSairSistema = document.getElementById("btnSairSistema");
  if (!btnSairSistema) return;

  // Cria o modal uma única vez
  criarModalSaidaSistema();

  // Clique no botão sair
  btnSairSistema.addEventListener("click", function (e) {
    e.preventDefault();
    abrirModalSaidaSistema();
  });
}

/* =========================================================
   6) INICIALIZAÇÃO GERAL
   ========================================================= */
document.addEventListener("DOMContentLoaded", function () {
  aplicarNomeSalaoGlobal();
  iniciarLogin();
  iniciarCadastro();
  iniciarAgendamento();
  iniciarBotaoSairSistema();
});

