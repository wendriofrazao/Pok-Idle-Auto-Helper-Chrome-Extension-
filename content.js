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

let configuracao = { ...CONFIG_PADRAO };
let automacaoAtiva = false;
let intervaloAutomacao = null;
let ultimaCompra = 0;
let ultimaAcao = 0;
let ultimoLog = "";
let ultimoLogEm = 0;

const INTERVALO_AUTOMACAO = 1000;
const INTERVALO_COMPRA = 10000;
const INTERVALO_LOG = 5000;

function registrarLog(mensagem) {
  const agora = Date.now();

  if (mensagem === ultimoLog && agora - ultimoLogEm < INTERVALO_LOG) {
    return;
  }

  ultimoLog = mensagem;
  ultimoLogEm = agora;

  console.log(`[PokéIdle Auto Helper] ${mensagem}`);
}

async function carregarConfiguracao() {
  try {
    const dados = await chrome.storage.local.get("configuracao");

    configuracao = {
      ...CONFIG_PADRAO,
      ...(dados.configuracao || {}),
    };

    automacaoAtiva = Boolean(configuracao.ativo);
  } catch (erro) {
    registrarLog("Não foi possível carregar as configurações.");
  }
}

function converterNumero(texto) {
  if (texto === null || texto === undefined || texto === "") {
    return null;
  }

  const valor = String(texto)
    .trim()
    .replace(/[^\d.,-]/g, "");

  if (!valor) return null;

  const normalizado = valor.replace(/\./g, "").replace(",", ".");

  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : null;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function lerSaldoMoedas() {
  const elemento = document.querySelector("#tr-gold");

  if (!elemento) return null;

  const texto = elemento.textContent.trim();
  const numero = texto.replace(/\./g, "").replace(/[^\d]/g, "");

  return numero ? Number(numero) : null;
}

function lerEstoque(seletor) {
  return Array.from(document.querySelectorAll(`${seletor} .auto-chip`)).map(
    (botao) => {
      const titulo = botao.getAttribute("title") || "";
      const nome = titulo.split(" — ")[0].trim();
      const textoQuantidade = botao.querySelector(".q")?.textContent ?? "0";

      return {
        nome,
        quantidade: converterNumero(textoQuantidade) ?? 0,
      };
    },
  );
}

function contarEquipe() {
  const seletores = [
    ".lista-poke .poke-linha",
    ".lista-poke .poke-card",
    ".lista-poke .pokemon",
  ];

  for (const seletor of seletores) {
    const elementos = document.querySelectorAll(seletor);

    if (elementos.length > 0) {
      return elementos.length;
    }
  }

  return 0;
}

function contarDepot() {
  const contador = document.querySelector('[data-eco-n="depot"]');

  if (contador) {
    const numero = converterNumero(contador.textContent);

    if (numero !== null) return numero;
  }

  const grade = document.querySelector(".eco-grade-pk");

  if (!grade) return null;
  if (grade.querySelector(".eco-vazio")) return 0;

  return grade.querySelectorAll(
    ".eco-pk-card, .eco-pk, .eco-card, [data-pokemon]",
  ).length;
}

function obterEstatisticas() {
  const pokebolas = lerEstoque("#auto-ball-opts");
  const pocoes = lerEstoque("#auto-potion-opts");

  return {
    moedas: lerSaldoMoedas(),
    equipe: contarEquipe(),
    depot: contarDepot(),
    pokebolas,
    pocoes,
    totalPokebolas: pokebolas.reduce(
      (total, item) => total + item.quantidade,
      0,
    ),
    totalPocoes: pocoes.reduce((total, item) => total + item.quantidade, 0),
    atualizadoEm: Date.now(),
  };
}

/* Preços da loja */

function encontrarCardLoja(nomeItem) {
  const nomeNormalizado = normalizarTexto(nomeItem);

  return (
    Array.from(document.querySelectorAll(".mk-card")).find((card) => {
      const elementoNome = card.querySelector(".mk-nome");

      const nome = normalizarTexto(
        elementoNome?.getAttribute("title") || elementoNome?.textContent,
      );

      return nome === nomeNormalizado;
    }) ?? null
  );
}

function lerPrecoUnitario(nomeItem) {
  const card = encontrarCardLoja(nomeItem);

  if (!card) return null;

  const preco = card.querySelector(".mk-preco .mk-moeda");

  return preco ? converterNumero(preco.textContent) : null;
}

function calcularCustoCompra(nomeItem, quantidade) {
  const quantidadeValida = Math.min(
    9999,
    Math.max(1, Math.floor(Number(quantidade) || 1)),
  );

  const precoUnitario = lerPrecoUnitario(nomeItem);

  return {
    precoUnitario,
    quantidade: quantidadeValida,
    custoTotal:
      precoUnitario === null ? null : precoUnitario * quantidadeValida,
  };
}

function obterCustos() {
  const bolas = calcularCustoCompra(
    configuracao.bolaSelecionada,
    configuracao.quantidadeBolas,
  );

  const pocoes = calcularCustoCompra(
    configuracao.pocaoSelecionada,
    configuracao.quantidadePocoes,
  );

  return {
    bolas,
    pocoes,
    total:
      bolas.custoTotal === null || pocoes.custoTotal === null
        ? null
        : bolas.custoTotal + pocoes.custoTotal,
  };
}

/* Elementos e captura */

function elementoVisivel(elemento) {
  if (!elemento || !elemento.isConnected) return false;

  const estilo = getComputedStyle(elemento);

  return (
    estilo.display !== "none" &&
    estilo.visibility !== "hidden" &&
    Number(estilo.opacity) !== 0 &&
    elemento.getClientRects().length > 0
  );
}

function elementoHabilitado(elemento) {
  if (!elemento) return false;

  return (
    !elemento.disabled &&
    elemento.getAttribute("aria-disabled") !== "true" &&
    !elemento.classList.contains("disabled")
  );
}

function encontrarPokemonCaido() {
  const lista = document.querySelector("#caidos-lista");

  if (!lista) return null;

  const pokemons = Array.from(lista.querySelectorAll("button.caido"));

  return (
    pokemons.find((pokemon) => {
      return (
        elementoVisivel(pokemon) &&
        elementoHabilitado(pokemon) &&
        !pokemon.classList.contains("acabando")
      );
    }) ?? null
  );
}

function capturarPokemonCaido() {
  if (!configuracao.capturarPokemon) return false;

  const alvo = encontrarPokemonCaido();

  if (!alvo) return false;

  alvo.click();

  registrarLog(`Clique enviado para captura: ${alvo.innerText.trim()}`);

  return true;
}

/* Cura */

function curarEquipe() {
  if (!configuracao.curarAutomaticamente) return false;

  const botao = document.querySelector("#centro-curar");

  if (!elementoVisivel(botao) || !elementoHabilitado(botao)) {
    return false;
  }

  botao.click();

  registrarLog("Comando de cura enviado.");

  return true;
}

/* Compras */

function encontrarBotaoLoja() {
  const seletores = [
    'button[data-modal="market"]',
    '[data-modal="market"]',
    "#abrir-market",
    "#btn-market",
  ];

  for (const seletor of seletores) {
    const elemento = document.querySelector(seletor);

    if (elementoVisivel(elemento) && elementoHabilitado(elemento)) {
      return elemento;
    }
  }

  return null;
}

function comprarItem(nomeItem, quantidade) {
  if (Date.now() - ultimaCompra < INTERVALO_COMPRA) {
    return false;
  }

  const card = encontrarCardLoja(nomeItem);

  if (!card) return false;

  const campoQuantidade = card.querySelector('.mk-qtd input[type="number"]');

  if (campoQuantidade) {
    const quantidadeValida = Math.min(
      9999,
      Math.max(1, Math.floor(Number(quantidade) || 1)),
    );

    campoQuantidade.value = String(quantidadeValida);

    campoQuantidade.dispatchEvent(new Event("input", { bubbles: true }));

    campoQuantidade.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const botaoComprar = card.querySelector("button.mk-acao");

  if (!elementoVisivel(botaoComprar) || !elementoHabilitado(botaoComprar)) {
    return false;
  }

  botaoComprar.click();

  ultimaCompra = Date.now();

  registrarLog(`Compra solicitada: ${nomeItem}.`);

  return true;
}

function tentarComprar(nomeItem, quantidade) {
  const card = encontrarCardLoja(nomeItem);

  if (card) {
    return comprarItem(nomeItem, quantidade);
  }

  const botaoLoja = encontrarBotaoLoja();

  if (botaoLoja) {
    botaoLoja.click();

    registrarLog("Loja aberta para localizar o item.");
  }

  return false;
}

function verificarCompras() {
  if (Date.now() - ultimaCompra < INTERVALO_COMPRA) {
    return;
  }

  const bolas = lerEstoque("#auto-ball-opts");
  const pocoes = lerEstoque("#auto-potion-opts");

  if (configuracao.comprarBolas) {
    const itemBola = bolas.find(
      (item) =>
        normalizarTexto(item.nome) ===
        normalizarTexto(configuracao.bolaSelecionada),
    );

    if (itemBola && itemBola.quantidade <= 0) {
      tentarComprar(configuracao.bolaSelecionada, configuracao.quantidadeBolas);

      return;
    }
  }

  if (configuracao.comprarPocoes) {
    const itemPocao = pocoes.find(
      (item) =>
        normalizarTexto(item.nome) ===
        normalizarTexto(configuracao.pocaoSelecionada),
    );

    if (itemPocao && itemPocao.quantidade <= 0) {
      tentarComprar(
        configuracao.pocaoSelecionada,
        configuracao.quantidadePocoes,
      );
    }
  }
}

/* Ciclo da automação */

function executarAutomacao() {
  if (!automacaoAtiva) return;

  if (Date.now() - ultimaAcao < INTERVALO_AUTOMACAO) {
    return;
  }

  ultimaAcao = Date.now();

  if (capturarPokemonCaido()) return;

  if (curarEquipe()) return;

  verificarCompras();
}

async function iniciarAutomacao() {
  automacaoAtiva = true;
  configuracao.ativo = true;

  if (intervaloAutomacao) {
    clearInterval(intervaloAutomacao);
  }

  intervaloAutomacao = setInterval(executarAutomacao, INTERVALO_AUTOMACAO);

  await chrome.storage.local.set({ configuracao });

  registrarLog("Automação iniciada.");
}

async function pararAutomacao() {
  automacaoAtiva = false;
  configuracao.ativo = false;

  if (intervaloAutomacao) {
    clearInterval(intervaloAutomacao);
    intervaloAutomacao = null;
  }

  await chrome.storage.local.set({ configuracao });

  registrarLog("Automação pausada.");
}

function irParaCentro() {
  const botao = document.querySelector("#ir-centro");

  if (!elementoVisivel(botao) || !elementoHabilitado(botao)) {
    registrarLog("Botão de ir para o centro indisponível.");
    return false;
  }

  botao.click();

  registrarLog("Comando para ir ao centro enviado.");

  return true;
}

/* Comunicação com o popup */

chrome.runtime.onMessage.addListener((mensagem, remetente, sendResponse) => {
  if (!mensagem?.acao) return;

  if (mensagem.acao === "iniciar") {
    configuracao = {
      ...configuracao,
      ...(mensagem.configuracao || {}),
    };

    iniciarAutomacao().then(() => {
      sendResponse({
        sucesso: true,
        ativo: automacaoAtiva,
      });
    });

    return true;
  }

  if (mensagem.acao === "parar") {
    pararAutomacao().then(() => {
      sendResponse({
        sucesso: true,
        ativo: automacaoAtiva,
      });
    });

    return true;
  }

  if (mensagem.acao === "configurar") {
    configuracao = {
      ...configuracao,
      ...(mensagem.configuracao || {}),
    };

    chrome.storage.local.set({ configuracao }, () => {
      sendResponse({ sucesso: true });
    });

    return true;
  }

  if (mensagem.acao === "obterStatus") {
    sendResponse({
      ativo: automacaoAtiva,
      estatisticas: obterEstatisticas(),
    });

    return;
  }

  if (mensagem.acao === "obterEstatisticas") {
    sendResponse({
      estatisticas: obterEstatisticas(),
      custos: obterCustos(),
    });

    return;
  }

  if (mensagem.acao === "irCentro") {
    sendResponse({
      sucesso: irParaCentro(),
    });
  }
});

carregarConfiguracao().then(() => {
  if (automacaoAtiva) {
    iniciarAutomacao();
  }
});

registrarLog("Content script carregado.");
