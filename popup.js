const DEFAULT_CONFIG = {
  ativo: false,
  capturarPokemon: true,
  curarAutomaticamente: true,
  voltarCentro: true,
  comprarBolas: true,
  comprarPocoes: true,
};

let configuracao = {
  ...DEFAULT_CONFIG,
};

let tabAtual = null;

document.addEventListener("DOMContentLoaded", async () => {
  await carregarConfiguracao();
  await obterAbaPokIdle();

  configurarEventos();

  atualizarInterface();
  atualizarDadosPagina();
});

async function carregarConfiguracao() {
  try {
    configuracao = await chrome.storage.local.get(DEFAULT_CONFIG);
  } catch (erro) {
    adicionarLog(`Erro ao carregar configuração: ${erro.message}`);
  }
}

async function salvarConfiguracao() {
  try {
    await chrome.storage.local.set(configuracao);
  } catch (erro) {
    adicionarLog(`Erro ao salvar configuração: ${erro.message}`);
  }
}

async function obterAbaPokIdle() {
  try {
    const abas = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const aba = abas[0];

    if (!aba || !aba.url) {
      tabAtual = null;
      return;
    }

    if (!aba.url.startsWith("https://pokeidle.io/")) {
      tabAtual = null;

      atualizarStatusPagina("Abra o PokéIdle para usar a extensão.");

      return;
    }

    tabAtual = aba;
  } catch (erro) {
    adicionarLog(`Erro ao localizar PokéIdle: ${erro.message}`);
  }
}

function configurarEventos() {
  const btnIniciar = document.getElementById("btn-iniciar");
  const btnParar = document.getElementById("btn-parar");
  const btnIrCentro = document.getElementById("btn-ir-centro");

  const capturarPokemon = document.getElementById("capturar-pokemon");

  const curarAutomaticamente = document.getElementById("curar-automaticamente");

  const voltarCentro = document.getElementById("voltar-centro");

  const comprarBolas = document.getElementById("comprar-bolas");

  const comprarPocoes = document.getElementById("comprar-pocoes");

  btnIniciar?.addEventListener("click", async () => {
    configuracao.ativo = true;

    await salvarConfiguracao();

    await enviarMensagem({
      acao: "iniciar",
      configuracao,
    });

    atualizarInterface();

    adicionarLog("Automação iniciada.");
  });

  btnParar?.addEventListener("click", async () => {
    configuracao.ativo = false;

    await salvarConfiguracao();

    await enviarMensagem({
      acao: "parar",
    });

    atualizarInterface();

    adicionarLog("Automação parada.");
  });

  btnIrCentro?.addEventListener("click", async () => {
    const resposta = await enviarMensagem({
      acao: "irCentro",
    });

    if (resposta?.sucesso) {
      adicionarLog("Retornando ao Centro Pokémon.");
    } else {
      adicionarLog("Não foi possível ir ao Centro.");
    }
  });

  capturarPokemon?.addEventListener("change", async (evento) => {
    configuracao.capturarPokemon = evento.target.checked;

    await salvarConfiguracao();

    await enviarMensagem({
      acao: "configurar",
      configuracao,
    });

    adicionarLog(
      `Captura automática ${
        configuracao.capturarPokemon ? "ativada" : "desativada"
      }.`,
    );
  });

  curarAutomaticamente?.addEventListener("change", async (evento) => {
    configuracao.curarAutomaticamente = evento.target.checked;

    await salvarConfiguracao();

    await enviarMensagem({
      acao: "configurar",
      configuracao,
    });

    adicionarLog(
      `Cura automática ${
        configuracao.curarAutomaticamente ? "ativada" : "desativada"
      }.`,
    );
  });

  voltarCentro?.addEventListener("change", async (evento) => {
    configuracao.voltarCentro = evento.target.checked;

    await salvarConfiguracao();

    await enviarMensagem({
      acao: "configurar",
      configuracao,
    });

    adicionarLog(
      `Retorno ao Centro ${
        configuracao.voltarCentro ? "ativado" : "desativado"
      }.`,
    );
  });

  comprarBolas?.addEventListener("change", async (evento) => {
    configuracao.comprarBolas = evento.target.checked;

    await salvarConfiguracao();

    await enviarMensagem({
      acao: "configurar",
      configuracao,
    });

    adicionarLog(
      `Compra de Pokébolas ${
        configuracao.comprarBolas ? "ativada" : "desativada"
      }.`,
    );
  });

  comprarPocoes?.addEventListener("change", async (evento) => {
    configuracao.comprarPocoes = evento.target.checked;

    await salvarConfiguracao();

    await enviarMensagem({
      acao: "configurar",
      configuracao,
    });

    adicionarLog(
      `Compra de Poções ${
        configuracao.comprarPocoes ? "ativada" : "desativada"
      }.`,
    );
  });
}

async function atualizarDadosPagina() {
  if (!tabAtual) {
    return;
  }

  const resposta = await enviarMensagem({
    acao: "obterStatus",
  });

  if (!resposta) {
    return;
  }

  if (typeof resposta.equipe !== "undefined") {
    document.getElementById("status-equipe").textContent =
      `${resposta.equipe} / 5`;
  }

  if (typeof resposta.bolas !== "undefined") {
    document.getElementById("status-bolas").textContent = formatarQuantidade(
      resposta.bolas,
    );
  }

  if (typeof resposta.pocoes !== "undefined") {
    document.getElementById("status-pocoes").textContent = formatarQuantidade(
      resposta.pocoes,
    );
  }

  if (typeof resposta.ativo !== "undefined") {
    configuracao.ativo = resposta.ativo;

    await chrome.storage.local.set({
      ativo: resposta.ativo,
    });
  }

  atualizarInterface();
}

async function enviarMensagem(mensagem) {
  if (!tabAtual?.id) {
    atualizarStatusPagina("Abra o PokéIdle para usar a extensão.");

    return null;
  }

  try {
    return await chrome.tabs.sendMessage(tabAtual.id, mensagem);
  } catch (erro) {
    adicionarLog("Não foi possível comunicar com o PokéIdle.");

    return null;
  }
}

function atualizarInterface() {
  const statusAutomacao = document.getElementById("status-automacao");

  const capturarPokemon = document.getElementById("capturar-pokemon");

  const curarAutomaticamente = document.getElementById("curar-automaticamente");

  const voltarCentro = document.getElementById("voltar-centro");

  const comprarBolas = document.getElementById("comprar-bolas");

  const comprarPocoes = document.getElementById("comprar-pocoes");

  capturarPokemon.checked = configuracao.capturarPokemon;

  curarAutomaticamente.checked = configuracao.curarAutomaticamente;

  voltarCentro.checked = configuracao.voltarCentro;

  comprarBolas.checked = configuracao.comprarBolas;

  comprarPocoes.checked = configuracao.comprarPocoes;

  if (configuracao.ativo) {
    statusAutomacao.textContent = "Ativada";

    statusAutomacao.classList.remove("status-off");

    statusAutomacao.classList.add("status-on");
  } else {
    statusAutomacao.textContent = "Desativada";

    statusAutomacao.classList.remove("status-on");

    statusAutomacao.classList.add("status-off");
  }
}

function atualizarStatusPagina(mensagem) {
  const status = document.getElementById("status-extensao");

  if (!status) {
    return;
  }

  status.textContent = mensagem;
}

function formatarQuantidade(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "0";
  }

  return numero.toLocaleString("pt-BR");
}

function adicionarLog(mensagem) {
  const container = document.getElementById("log-container");

  if (!container) {
    return;
  }

  const item = document.createElement("div");

  item.className = "log-item";

  const horario = new Date().toLocaleTimeString("pt-BR");

  item.textContent = `[${horario}] ${mensagem}`;

  container.prepend(item);

  while (container.children.length > 20) {
    container.removeChild(container.lastElementChild);
  }
}

chrome.storage.onChanged.addListener((changes) => {
  let alterou = false;

  Object.keys(DEFAULT_CONFIG).forEach((chave) => {
    if (changes[chave]) {
      configuracao[chave] = changes[chave].newValue;

      alterou = true;
    }
  });

  if (alterou) {
    atualizarInterface();
  }
});
