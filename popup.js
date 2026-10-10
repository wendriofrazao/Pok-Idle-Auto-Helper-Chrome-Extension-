const CONFIG_PADRAO = {
  ativo: false,
  capturarPokemon: true,
  curarAutomaticamente: true,
  voltarCentro: true,
  comprarBolas: true,
  comprarPocoes: true,
  bolaSelecionada: "Ultra Ball",
  quantidadeBolas: 1000,
  pocaoSelecionada: "Hyper Potion",
  quantidadePocoes: 1000,
};

const PRECOS_BOLAS = {
  "Poké Ball": 5,
  "Great Ball": 20,
  "Super Ball": 50,
  "Ultra Ball": 130,
  "Beast Ball": null,
};

const PRECOS_POCOES = {
  "Small Potion": 50,
  "Great Potion": 150,
  "Ultra Potion": 400,
  "Hyper Potion": 800,
  "Ultimate Potion": 1500,
  "Golden Potion": 2500,
};

let configuracao = { ...CONFIG_PADRAO };
let abaAtiva = null;
let intervaloEstatisticas = null;
let atualizandoEstatisticas = false;

const $ = (id) => document.getElementById(id);

function formatarNumero(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "Indisponível";
  }

  const numero = Number(valor);

  if (Number.isFinite(numero)) {
    return numero.toLocaleString("pt-BR");
  }

  if (typeof valor === "string" && valor.trim()) {
    return valor.trim();
  }

  return "Indisponível";
}

function formatarMoedas(valor) {
  if (
    valor === null ||
    valor === undefined ||
    !Number.isFinite(Number(valor))
  ) {
    return "Preço indisponível";
  }

  return `${formatarNumero(valor)} moedas`;
}

function registrarLog(mensagem, tipo = "info") {
  const container = $("log-container");
  if (!container) return;

  const mensagemInicial = container.querySelector(".texto-secundario");

  if (mensagemInicial) {
    mensagemInicial.remove();
  }

  const item = document.createElement("div");
  item.className = `log-item log-${tipo}`;
  item.textContent = `[${new Date().toLocaleTimeString("pt-BR")}] ${mensagem}`;

  container.prepend(item);

  while (container.children.length > 100) {
    container.lastElementChild.remove();
  }
}

function lerFormulario() {
  const quantidade = (id, padrao) =>
    Math.max(1, Math.min(9999, Math.floor(Number($(id)?.value) || padrao)));

  return {
    ativo: configuracao.ativo,
    capturarPokemon: $("capturar-pokemon")?.checked ?? true,
    curarAutomaticamente: $("curar-automaticamente")?.checked ?? true,
    voltarCentro: $("voltar-centro")?.checked ?? true,
    comprarBolas: $("comprar-bolas")?.checked ?? true,
    comprarPocoes: $("comprar-pocoes")?.checked ?? true,
    bolaSelecionada: $("tipo-pokebola")?.value ?? "Ultra Ball",
    quantidadeBolas: quantidade("quantidade-bolas", 1000),
    pocaoSelecionada: $("tipo-pocao")?.value ?? "Hyper Potion",
    quantidadePocoes: quantidade("quantidade-pocoes", 1000),
  };
}

function preencherFormulario(config) {
  const campos = {
    "capturar-pokemon": config.capturarPokemon,
    "curar-automaticamente": config.curarAutomaticamente,
    "voltar-centro": config.voltarCentro,
    "comprar-bolas": config.comprarBolas,
    "comprar-pocoes": config.comprarPocoes,
    "tipo-pokebola": config.bolaSelecionada,
    "quantidade-bolas": config.quantidadeBolas,
    "tipo-pocao": config.pocaoSelecionada,
    "quantidade-pocoes": config.quantidadePocoes,
  };

  for (const [id, valor] of Object.entries(campos)) {
    const campo = $(id);
    if (!campo) continue;

    if (campo.type === "checkbox") {
      campo.checked = Boolean(valor);
    } else {
      campo.value = valor;
    }
  }

  atualizarCustos();
  atualizarEstadoVisual();
}

async function carregarConfiguracao() {
  try {
    const resultado = await chrome.storage.local.get("configuracao");

    configuracao = {
      ...CONFIG_PADRAO,
      ...(resultado.configuracao || {}),
    };
  } catch (erro) {
    console.error("Erro ao carregar configuração:", erro);
    configuracao = { ...CONFIG_PADRAO };
  }

  preencherFormulario(configuracao);
}

async function salvarConfiguracao() {
  configuracao = {
    ...configuracao,
    ...lerFormulario(),
  };

  try {
    await chrome.storage.local.set({ configuracao });

    atualizarCustos();

    if (abaAtiva?.id) {
      chrome.tabs.sendMessage(
        abaAtiva.id,
        { acao: "configurar", configuracao },
        () => void chrome.runtime.lastError,
      );
    }

    return true;
  } catch (erro) {
    console.error("Erro ao salvar configuração:", erro);
    registrarLog("Não foi possível salvar a configuração.", "erro");
    return false;
  }
}

async function obterAbaJogo() {
  try {
    const abas = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const aba = abas[0];

    if (!aba?.id || !aba.url?.startsWith("https://pokeidle.io/")) {
      return null;
    }

    return aba;
  } catch (erro) {
    console.error("Erro ao localizar a aba:", erro);
    return null;
  }
}

async function enviarMensagem(mensagem, mostrarErro = true) {
  const aba = await obterAbaJogo();

  if (!aba) {
    abaAtiva = null;
    atualizarEstadoVisual();

    if (mostrarErro) {
      registrarLog("Abra o PokéIdle em uma aba para usar a extensão.", "erro");
    }

    return null;
  }

  abaAtiva = aba;

  return new Promise((resolve) => {
    chrome.tabs.sendMessage(aba.id, mensagem, (resposta) => {
      if (chrome.runtime.lastError) {
        if (mostrarErro) {
          registrarLog(
            "Não foi possível comunicar com o jogo. Recarregue a página do PokéIdle.",
            "erro",
          );
        }

        resolve(null);
        return;
      }

      resolve(resposta ?? null);
    });
  });
}

function atualizarEstadoVisual() {
  const statusExtensao = $("status-extensao");
  const statusAutomacao = $("status-automacao");
  const botaoIniciar = $("btn-iniciar");
  const botaoParar = $("btn-parar");

  if (statusExtensao) {
    statusExtensao.textContent = abaAtiva ? "Conectada" : "Aguardando jogo";
  }

  if (statusAutomacao) {
    statusAutomacao.textContent = configuracao.ativo ? "Ativa" : "Parada";

    statusAutomacao.classList.toggle("status-inativo", !configuracao.ativo);
  }

  if (botaoIniciar) {
    botaoIniciar.disabled = Boolean(configuracao.ativo);
  }

  if (botaoParar) {
    botaoParar.disabled = !configuracao.ativo;
  }
}

function atualizarCustos() {
  const tipoBola = $("tipo-pokebola")?.value ?? configuracao.bolaSelecionada;

  const tipoPocao = $("tipo-pocao")?.value ?? configuracao.pocaoSelecionada;

  const quantidadeBolas = Math.max(
    1,
    Math.min(9999, Math.floor(Number($("quantidade-bolas")?.value) || 1)),
  );

  const quantidadePocoes = Math.max(
    1,
    Math.min(9999, Math.floor(Number($("quantidade-pocoes")?.value) || 1)),
  );

  const precoBola = PRECOS_BOLAS[tipoBola];
  const precoPocao = PRECOS_POCOES[tipoPocao];

  const custoBolas = precoBola == null ? null : precoBola * quantidadeBolas;

  const custoPocoes = precoPocao == null ? null : precoPocao * quantidadePocoes;

  const custoTotal =
    custoBolas == null || custoPocoes == null ? null : custoBolas + custoPocoes;

  if ($("custo-bolas")) {
    $("custo-bolas").textContent = formatarMoedas(custoBolas);
  }

  if ($("custo-pocoes")) {
    $("custo-pocoes").textContent = formatarMoedas(custoPocoes);
  }

  if ($("custo-total")) {
    $("custo-total").textContent = formatarMoedas(custoTotal);
  }
}

function extrairDados(resposta) {
  if (!resposta || typeof resposta !== "object") {
    return {};
  }

  const dados =
    resposta.estatisticas ?? resposta.dados ?? resposta.status ?? resposta;

  return dados && typeof dados === "object" ? dados : {};
}

function obterCampo(dados, nomes) {
  for (const nome of nomes) {
    if (dados[nome] !== undefined && dados[nome] !== null) {
      return dados[nome];
    }
  }

  return undefined;
}

function obterQuantidade(valor) {
  if (valor === undefined || valor === null) {
    return undefined;
  }

  if (typeof valor === "number" || typeof valor === "string") {
    return valor;
  }

  if (typeof valor === "object" && !Array.isArray(valor)) {
    return obterCampo(valor, [
      "quantidade",
      "total",
      "count",
      "quantidadeAtual",
      "disponiveis",
      "disponivel",
      "valor",
    ]);
  }

  return undefined;
}

function atualizarElemento(id, valor) {
  const elemento = $(id);

  if (elemento && valor !== undefined) {
    elemento.textContent = formatarNumero(obterQuantidade(valor));
  }
}

function somarEstoque(itens) {
  if (!Array.isArray(itens)) return undefined;

  return itens.reduce((total, item) => {
    const quantidade = Number(obterQuantidade(item)) || 0;
    return total + quantidade;
  }, 0);
}

function atualizarEstoque(dados = {}) {
  const bolas = $("status-bolas");
  const pocoes = $("status-pocoes");
  const equipe = $("status-equipe");

  const listaBolas = Array.isArray(dados.pokebolas)
    ? dados.pokebolas
    : Array.isArray(dados.listaBolas)
      ? dados.listaBolas
      : [];

  const listaPocoes = Array.isArray(dados.pocoes)
    ? dados.pocoes
    : Array.isArray(dados.pocoesLista)
      ? dados.pocoesLista
      : Array.isArray(dados.listaPocoes)
        ? dados.listaPocoes
        : [];

  const totalBolas =
    obterCampo(dados, ["totalPokebolas", "totalBolas"]) ??
    somarEstoque(listaBolas);

  const totalPocoes =
    obterCampo(dados, ["totalPocoes", "pocoesTotal"]) ??
    somarEstoque(listaPocoes);

  if (bolas && totalBolas !== undefined) {
    bolas.textContent = formatarNumero(totalBolas);
  }

  if (pocoes && totalPocoes !== undefined) {
    pocoes.textContent = formatarNumero(totalPocoes);
  }

  if (equipe && dados.equipe !== undefined) {
    equipe.textContent = formatarNumero(obterQuantidade(dados.equipe));
  }
}

function atualizarListaEstatisticas(id, itens) {
  const lista = $(id);
  if (!lista) return;

  lista.replaceChildren();

  if (!Array.isArray(itens) || itens.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "texto-secundario";
    vazio.textContent = "Nenhum item encontrado.";
    lista.appendChild(vazio);
    return;
  }

  for (const item of itens) {
    const elemento = document.createElement("div");
    elemento.className = "item-estoque";

    if (typeof item === "string") {
      elemento.textContent = item;
    } else {
      const nome = item.nome ?? item.name ?? item.item ?? "Item";
      const quantidade =
        item.quantidade ??
        item.count ??
        item.total ??
        item.quantidadeAtual ??
        0;

      elemento.textContent = `${nome}: ${formatarNumero(quantidade)}`;
    }

    lista.appendChild(elemento);
  }
}

function atualizarInterfaceEstatisticas(dados = {}) {
  const moedas = obterCampo(dados, [
    "moedas",
    "ouro",
    "gold",
    "coins",
    "saldo",
  ]);

  const equipe = obterCampo(dados, ["equipe", "time", "team", "totalEquipe"]);

  const depot = obterCampo(dados, [
    "depot",
    "deposito",
    "depósito",
    "armazenamento",
  ]);

  const bolas =
    obterCampo(dados, ["totalPokebolas", "totalBolas"]) ??
    somarEstoque(dados.pokebolas ?? dados.listaBolas);

  const pocoes =
    obterCampo(dados, ["totalPocoes", "pocoesTotal"]) ??
    somarEstoque(dados.pocoes ?? dados.pocoesLista ?? dados.listaPocoes);

  atualizarElemento("estat-moedas", moedas);
  atualizarElemento("estat-equipe", equipe);
  atualizarElemento("estat-depot", depot);
  atualizarElemento("estat-bolas", bolas);
  atualizarElemento("estat-pocoes", pocoes);

  atualizarListaEstatisticas(
    "lista-bolas",
    dados.pokebolas ?? dados.listaBolas,
  );

  atualizarListaEstatisticas(
    "lista-pocoes",
    dados.pocoes ?? dados.pocoesLista ?? dados.listaPocoes,
  );

  if ($("estat-atualizado")) {
    $("estat-atualizado").textContent =
      `Atualizado às ${new Date().toLocaleTimeString("pt-BR")}`;
  }

  atualizarEstoque(dados);
}

async function atualizarEstatisticas() {
  if (atualizandoEstatisticas) return;

  atualizandoEstatisticas = true;

  try {
    const resposta = await enviarMensagem({ acao: "obterEstatisticas" }, false);

    if (!resposta) {
      if ($("estat-atualizado")) {
        $("estat-atualizado").textContent =
          "Não foi possível obter os dados. Recarregue o jogo.";
      }

      return;
    }

    const dados = extrairDados(resposta);
    atualizarInterfaceEstatisticas(dados);
  } catch (erro) {
    console.error("Erro ao atualizar estatísticas:", erro);

    if ($("estat-atualizado")) {
      $("estat-atualizado").textContent = "Erro ao atualizar estatísticas.";
    }
  } finally {
    atualizandoEstatisticas = false;
  }
}

async function iniciar() {
  if (!(await salvarConfiguracao())) return;

  const resposta = await enviarMensagem({
    acao: "iniciar",
    configuracao,
  });

  if (!resposta) return;

  configuracao.ativo = true;
  await chrome.storage.local.set({ configuracao });

  atualizarEstadoVisual();
  registrarLog("Automação iniciada.", "sucesso");
}

async function parar() {
  const resposta = await enviarMensagem({ acao: "parar" });

  if (!resposta) return;

  configuracao.ativo = false;
  await chrome.storage.local.set({ configuracao });

  atualizarEstadoVisual();
  registrarLog("Automação parada.");
}

async function irCentro() {
  const resposta = await enviarMensagem({ acao: "irCentro" });

  if (resposta) {
    registrarLog("Solicitação para ir ao centro enviada.", "sucesso");
  }
}

async function abrirEstatisticas() {
  const modal = $("modal-estatisticas");

  if (!modal) {
    console.error("Modal de estatísticas não encontrado.");
    registrarLog("Modal de estatísticas não encontrado no HTML.", "erro");
    return;
  }

  modal.hidden = false;
  modal.style.display = "flex";
  modal.classList.add("ativo");
  modal.setAttribute("aria-hidden", "false");

  await atualizarEstatisticas();
}

function fecharEstatisticas() {
  const modal = $("modal-estatisticas");

  if (!modal) return;

  modal.classList.remove("ativo");
  modal.style.display = "none";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
}

function limparLogs() {
  const container = $("log-container");
  if (!container) return;

  container.replaceChildren();

  const mensagem = document.createElement("p");
  mensagem.className = "texto-secundario";
  mensagem.textContent = "Os eventos da extensão aparecerão aqui.";

  container.appendChild(mensagem);
}

async function inicializar() {
  await carregarConfiguracao();

  abaAtiva = await obterAbaJogo();

  atualizarEstadoVisual();
  atualizarCustos();

  $("btn-iniciar")?.addEventListener("click", iniciar);
  $("btn-parar")?.addEventListener("click", parar);
  $("btn-ir-centro")?.addEventListener("click", irCentro);

  $("btn-estatisticas")?.addEventListener("click", abrirEstatisticas);

  $("fechar-estatisticas")?.addEventListener("click", fecharEstatisticas);

  $("btn-atualizar-estatisticas")?.addEventListener(
    "click",
    atualizarEstatisticas,
  );

  $("btn-limpar-logs")?.addEventListener("click", limparLogs);

  for (const id of [
    "capturar-pokemon",
    "curar-automaticamente",
    "voltar-centro",
    "comprar-bolas",
    "comprar-pocoes",
    "tipo-pokebola",
    "quantidade-bolas",
    "tipo-pocao",
    "quantidade-pocoes",
  ]) {
    const elemento = $(id);
    if (!elemento) continue;

    elemento.addEventListener("change", async () => {
      atualizarCustos();
      await salvarConfiguracao();
    });

    if (elemento.type === "number") {
      elemento.addEventListener("input", atualizarCustos);
    }
  }

  $("modal-estatisticas")?.addEventListener("click", (evento) => {
    if (evento.target === $("modal-estatisticas")) {
      fecharEstatisticas();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (
      evento.key === "Escape" &&
      $("modal-estatisticas") &&
      !$("modal-estatisticas").hidden
    ) {
      fecharEstatisticas();
    }
  });

  await salvarConfiguracao();

  if (abaAtiva) {
    const resposta = await enviarMensagem({ acao: "obterStatus" }, false);

    if (resposta) {
      const dados = extrairDados(resposta);

      if (typeof resposta.ativo === "boolean") {
        configuracao.ativo = resposta.ativo;
      } else if (typeof dados.ativo === "boolean") {
        configuracao.ativo = dados.ativo;
      }

      atualizarEstadoVisual();
      atualizarEstoque(dados);
    }

    await atualizarEstatisticas();
  }

  if (intervaloEstatisticas) {
    clearInterval(intervaloEstatisticas);
  }

  intervaloEstatisticas = setInterval(() => {
    const modal = $("modal-estatisticas");

    if (document.visibilityState === "visible" && modal && !modal.hidden) {
      atualizarEstatisticas();
    }
  }, 5000);
}

document.addEventListener("DOMContentLoaded", inicializar);
