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
let compraEmAndamento = false;
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

  let valor = String(texto)
    .trim()
    .replace(/[^\d.,-]/g, "");

  if (!valor) return null;

  if (valor.includes(",") && valor.includes(".")) {
    valor = valor.replace(/\./g, "").replace(",", ".");
  } else if (valor.includes(",")) {
    valor = valor.replace(",", ".");
  } else if (/\.\d{3}$/.test(valor)) {
    valor = valor.replace(/\./g, "");
  }

  const numero = Number(valor);
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

  return converterNumero(elemento.textContent);
}

function lerEstoque(seletor) {
  const container = document.querySelector(seletor);

  if (!container) return null;

  return Array.from(container.querySelectorAll(".auto-chip"))
    .map((botao) => {
      const titulo = botao.getAttribute("title") || "";

      const nomeElemento = botao.querySelector(
        ".nome, .name, .label, .auto-chip-nome, span:not(.q)",
      );

      const nome = (
        nomeElemento?.textContent ||
        titulo.split(/[—–]/)[0] ||
        botao.getAttribute("aria-label") ||
        ""
      ).trim();

      const elementoQuantidade = botao.querySelector(
        ".q, .quantidade, .qtd, [data-quantidade]",
      );

      const atributoQuantidade =
        elementoQuantidade?.getAttribute("data-quantidade") ??
        botao.getAttribute("data-quantidade");

      const textoQuantidade =
        elementoQuantidade?.textContent ?? atributoQuantidade ?? null;

      const quantidade =
        textoQuantidade === null ? null : converterNumero(textoQuantidade);

      return { nome, quantidade };
    })
    .filter((item) => item.nome);
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
  const pokebolas = lerEstoque("#auto-ball-opts") || [];
  const pocoes = lerEstoque("#auto-potion-opts") || [];

  return {
    moedas: lerSaldoMoedas(),
    equipe: contarEquipe(),
    depot: contarDepot(),
    pokebolas,
    pocoes,
    totalPokebolas: pokebolas.reduce(
      (total, item) => total + (item.quantidade || 0),
      0,
    ),
    totalPocoes: pocoes.reduce(
      (total, item) => total + (item.quantidade || 0),
      0,
    ),
    atualizadoEm: Date.now(),
  };
}

/* Loja */

function encontrarCardLoja(nomeItem) {
  const nomeNormalizado = normalizarTexto(nomeItem);

  return (
    Array.from(document.querySelectorAll("#mk-corpo .mk-card")).find((card) => {
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

/* Elementos */

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

/* Captura */

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

/* Retorno ao Centro */

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

function voltarCentroAutomaticamente() {
  if (!configuracao.voltarCentro) return false;

  if (contarEquipe() < 5) return false;

  return irParaCentro();
}

/* Abrir e fechar Market */

function encontrarBotaoLoja() {
  const botao = document.querySelector('button[data-modal="market"]');

  if (elementoVisivel(botao) && elementoHabilitado(botao)) {
    return botao;
  }

  return null;
}

function marketEstaAberto() {
  const modal = document.querySelector("#modal");
  const titulo = document.querySelector("#modal-titulo");
  const corpoLoja = document.querySelector("#mk-corpo");

  if (!modal || modal.classList.contains("hidden")) return false;

  if (!elementoVisivel(modal) || !elementoVisivel(corpoLoja)) {
    return false;
  }

  return normalizarTexto(titulo?.textContent) === "market";
}

async function abrirMarket() {
  if (marketEstaAberto()) return true;

  const botao = encontrarBotaoLoja();

  if (!botao) {
    registrarLog("Botão de abertura do Market não encontrado.");
    return false;
  }

  botao.click();

  registrarLog("Abrindo Market para comprar itens.");

  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!marketEstaAberto()) {
    registrarLog("O Market não abriu após clicar no botão.");
    return false;
  }

  return true;
}

function fecharMarket() {
  if (!marketEstaAberto()) return true;

  const botaoFechar = document.querySelector("#modal-fechar");

  if (!botaoFechar || !elementoHabilitado(botaoFechar)) {
    registrarLog("Não foi possível localizar o botão de fechar o Market.");
    return false;
  }

  botaoFechar.click();

  setTimeout(() => {
    const modalAtual = document.querySelector("#modal");
    const fechado = !modalAtual || modalAtual.classList.contains("hidden");

    registrarLog(
      fechado
        ? "Market fechado após a compra."
        : "O Market continua aberto após clicar em fechar.",
    );
  }, 300);

  return true;
}
/* Categorias da loja */

function selecionarCategoriaLoja(categoria) {
  const corpoLoja = document.querySelector("#mk-corpo");

  if (!corpoLoja) return "indisponivel";

  const categorias = Array.from(corpoLoja.querySelectorAll(".mk-cat"));

  const botao = categorias.find((elemento) => {
    return normalizarTexto(elemento.textContent) === normalizarTexto(categoria);
  });

  if (!botao || !elementoVisivel(botao) || !elementoHabilitado(botao)) {
    registrarLog(`Categoria "${categoria}" não encontrada na loja.`);
    return "indisponivel";
  }

  if (botao.classList.contains("on")) {
    return "selecionada";
  }

  botao.click();

  registrarLog(`Categoria selecionada: ${categoria}.`);

  return "alterada";
}

/* Aba de compra */

function selecionarAbaCompra() {
  const corpoLoja = document.querySelector("#mk-corpo");

  if (!corpoLoja) return false;

  if (corpoLoja.dataset.aba === "compra") {
    return true;
  }

  const seletores = [
    'button[data-aba="compra"]',
    'button[data-tela="compra"]',
    ".mk-aba[data-aba='compra']",
    ".mk-tab[data-aba='compra']",
    "#mk-abas button",
    ".mk-abas button",
    ".mk-tabs button",
  ];

  for (const seletor of seletores) {
    const botoes = Array.from(document.querySelectorAll(seletor));

    const botao = botoes.find((elemento) => {
      const texto = normalizarTexto(elemento.textContent);

      const atributo = normalizarTexto(
        elemento.getAttribute("data-aba") || elemento.getAttribute("data-tela"),
      );

      return atributo === "compra" || texto === "comprar" || texto === "compra";
    });

    if (elementoVisivel(botao) && elementoHabilitado(botao)) {
      botao.click();

      registrarLog("Selecionando a aba de compra.");

      return false;
    }
  }

  registrarLog("Não foi possível localizar a aba de compra do Market.");

  return false;
}

/* Compra */

function comprarItem(nomeItem, quantidade) {
  if (Date.now() - ultimaCompra < INTERVALO_COMPRA) {
    return false;
  }

  const card = encontrarCardLoja(nomeItem);

  if (!card) {
    registrarLog(`Card não encontrado: ${nomeItem}.`);
    return false;
  }

  const campoQuantidade = card.querySelector('.mk-qtd input[type="number"]');

  const quantidadeValida = Math.min(
    9999,
    Math.max(1, Math.floor(Number(quantidade) || 1)),
  );

  if (campoQuantidade) {
    campoQuantidade.value = String(quantidadeValida);

    campoQuantidade.dispatchEvent(new Event("input", { bubbles: true }));

    campoQuantidade.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const botaoComprar = card.querySelector("button.mk-acao");

  if (!elementoVisivel(botaoComprar) || !elementoHabilitado(botaoComprar)) {
    registrarLog(`Botão de compra indisponível para ${nomeItem}.`);
    return false;
  }

  botaoComprar.click();

  ultimaCompra = Date.now();

  registrarLog(
    `Compra solicitada: ${quantidadeValida} unidade(s) de ${nomeItem}.`,
  );

  setTimeout(() => {
    fecharMarket();
  }, 1000);

  return true;
}

async function tentarComprar(nomeItem, quantidade, categoria) {
  if (!marketEstaAberto()) {
    await abrirMarket();
    return true;
  }

  const corpoLoja = document.querySelector("#mk-corpo");

  if (!corpoLoja) {
    registrarLog("Conteúdo do Market não encontrado.");
    return false;
  }

  if (corpoLoja.dataset.aba !== "compra") {
    selecionarAbaCompra();
    return true;
  }

  const resultadoCategoria = selecionarCategoriaLoja(categoria);

  if (resultadoCategoria === "indisponivel") {
    return false;
  }

  if (resultadoCategoria === "alterada") {
    return true;
  }

  const card = encontrarCardLoja(nomeItem);

  if (!card) {
    registrarLog(`${nomeItem} não encontrado na categoria ${categoria}.`);

    return false;
  }

  return comprarItem(nomeItem, quantidade);
}

/* Monitoramento de estoque */

function verificarCompras() {
  if (compraEmAndamento || Date.now() - ultimaCompra < INTERVALO_COMPRA) {
    return false;
  }

  const bolas = lerEstoque("#auto-ball-opts");
  const pocoes = lerEstoque("#auto-potion-opts");

  const precisaComprar = (estoque, nomeConfigurado) => {
    if (estoque === null) return false;

    const item = estoque.find(
      (registro) =>
        normalizarTexto(registro.nome) === normalizarTexto(nomeConfigurado),
    );

    if (!item) return true;

    return item.quantidade !== null && item.quantidade <= 0;
  };

  if (
    configuracao.comprarBolas &&
    precisaComprar(bolas, configuracao.bolaSelecionada)
  ) {
    compraEmAndamento = true;

    Promise.resolve(
      tentarComprar(
        configuracao.bolaSelecionada,
        configuracao.quantidadeBolas,
        "Pokébolas",
      ),
    )
      .catch(() => {
        registrarLog("Erro ao tentar comprar Pokébolas.");
      })
      .finally(() => {
        setTimeout(() => {
          compraEmAndamento = false;
        }, 1200);
      });

    return true;
  }

  if (
    configuracao.comprarPocoes &&
    precisaComprar(pocoes, configuracao.pocaoSelecionada)
  ) {
    compraEmAndamento = true;

    Promise.resolve(
      tentarComprar(
        configuracao.pocaoSelecionada,
        configuracao.quantidadePocoes,
        "Poções",
      ),
    )
      .catch(() => {
        registrarLog("Erro ao tentar comprar Poções.");
      })
      .finally(() => {
        setTimeout(() => {
          compraEmAndamento = false;
        }, 1200);
      });

    return true;
  }

  return false;
}

/* Ciclo da automação */

function executarAutomacao() {
  if (!automacaoAtiva) return;

  if (Date.now() - ultimaAcao < INTERVALO_AUTOMACAO) {
    return;
  }

  ultimaAcao = Date.now();

  if (verificarCompras()) return;
  if (capturarPokemonCaido()) return;
  if (curarEquipe()) return;
  if (voltarCentroAutomaticamente()) return;
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

/* Comunicação com o popup */

chrome.runtime.onMessage.addListener((mensagem, remetente, sendResponse) => {
  if (!mensagem?.acao) return;

  if (mensagem.acao === "iniciar") {
    configuracao = {
      ...configuracao,
      ...(mensagem.configuracao || {}),
    };

    iniciarAutomacao()
      .then(() => {
        sendResponse({
          sucesso: true,
          ativo: automacaoAtiva,
        });
      })
      .catch((erro) => {
        registrarLog("Erro ao iniciar a automação.");

        sendResponse({
          sucesso: false,
          erro: erro.message,
        });
      });

    return true;
  }

  if (mensagem.acao === "parar") {
    pararAutomacao()
      .then(() => {
        sendResponse({
          sucesso: true,
          ativo: automacaoAtiva,
        });
      })
      .catch((erro) => {
        sendResponse({
          sucesso: false,
          erro: erro.message,
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
