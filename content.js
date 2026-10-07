console.log("[PokéIdle Extension] Carregada com sucesso!");

let comprando = false;
let automacaoAtiva = false;

const CONFIG_PADRAO = {
  capturarPokemon: true,
  curarAutomaticamente: true,
  voltarCentro: true,
  comprarBolas: true,
  comprarPocoes: true,
};

let configuracao = {
  ...CONFIG_PADRAO,
};

// LOOP PRINCIPAL

setInterval(() => {
  if (!automacaoAtiva) {
    return;
  }

  executarRotina();
}, 1000);

// ROTINA PRINCIPAL

function executarRotina() {
  const caidos = document.getElementById("caidos");
  const caido = document.querySelectorAll(".caido");
  const listaPoke = document.querySelectorAll(".lista-poke .poke-linha");

  const btnIrCentro = document.getElementById("ir-centro");
  const btnCurar = document.getElementById("centro-curar");

  // CURA NO CENTRO

  if (
    configuracao.curarAutomaticamente &&
    btnCurar &&
    !btnCurar.classList.contains("hidden") &&
    !btnCurar.classList.contains("fora")
  ) {
    btnCurar.click();

    console.log("[PokéIdle Extension] Equipe curada no Centro Pokémon!");
  }

  // RETORNO AO CENTRO COM EQUIPE CHEIA

  if (configuracao.voltarCentro && listaPoke.length >= 5) {
    if (
      btnIrCentro &&
      !btnIrCentro.disabled &&
      !btnIrCentro.classList.contains("hidden")
    ) {
      console.log(
        "[PokéIdle Extension] Equipe cheia! Voltando ao Centro Pokémon...",
      );

      btnIrCentro.click();
    }

    return;
  }

  // CAPTURA DE POKÉMONS CAÍDOS

  if (
    configuracao.capturarPokemon &&
    caidos &&
    !caidos.classList.contains("m-aberto")
  ) {
    caidos.classList.add("m-aberto");
  }

  if (configuracao.capturarPokemon) {
    caido.forEach((pokemon, index) => {
      setTimeout(() => {
        if (!automacaoAtiva) {
          return;
        }

        const listaAtual = document.querySelectorAll(".lista-poke .poke-linha");

        if (listaAtual.length >= 5) {
          return;
        }

        pokemon.click();
      }, index * 50);
    });
  }

  // SE JÁ ESTIVER COMPRANDO, NÃO EXECUTA OUTRA COMPRA

  if (comprando) {
    return;
  }

  // VERIFICAÇÃO DE POKÉBOLAS

  if (configuracao.comprarBolas) {
    const containerBolas = document.getElementById("auto-ball-opts");

    if (containerBolas) {
      const chipsBolas = containerBolas.querySelectorAll(".auto-chip");

      let totalBolas = 0;

      chipsBolas.forEach((chip) => {
        const qtdEl = chip.querySelector(".q");

        if (qtdEl) {
          const qtd =
            parseInt(qtdEl.textContent.replace(/\./g, "").trim(), 10) || 0;

          totalBolas += qtd;
        }
      });

      if (totalBolas <= 0) {
        console.log(
          "[PokéIdle Extension] Pokébolas esgotadas! Processando compra...",
        );

        comprarItem("bolas");

        return;
      }
    }
  }

  // VERIFICAÇÃO DE POÇÕES

  if (configuracao.comprarPocoes) {
    const containerPocoes = document.getElementById("auto-potion-opts");

    if (containerPocoes) {
      const chipsPocoes = containerPocoes.querySelectorAll(".auto-chip");

      let totalPocoes = 0;

      chipsPocoes.forEach((chip) => {
        const qtdEl = chip.querySelector(".q");

        if (qtdEl) {
          const qtd =
            parseInt(qtdEl.textContent.replace(/\./g, "").trim(), 10) || 0;

          totalPocoes += qtd;
        }
      });

      const todasVazias = Array.from(chipsPocoes).every((chip) =>
        chip.classList.contains("vazio"),
      );

      if (totalPocoes <= 0 || todasVazias) {
        console.log(
          "[PokéIdle Extension] Poções esgotadas! Processando compra...",
        );

        comprarItem("pocoes");

        return;
      }
    }
  }
}

// COMPRA DE ITENS

function comprarItem(tipoItem) {
  if (comprando) {
    return;
  }

  comprando = true;

  try {
    const modal = document.getElementById("modal");

    const btnMarket = document.querySelector('button[data-modal="market"]');

    if (modal && modal.classList.contains("hidden")) {
      if (btnMarket) {
        btnMarket.click();
      }
    }

    setTimeout(() => {
      const abas = document.querySelectorAll(".mk-aba");

      abas.forEach((aba) => {
        if (aba.dataset.aba === "compra") {
          aba.click();
        }
      });

      setTimeout(() => {
        const categorias = document.querySelectorAll(".mk-cat");

        categorias.forEach((cat) => {
          const texto = cat.textContent.trim().toLowerCase();

          if (
            tipoItem === "pocoes" &&
            (texto.includes("poções") || texto.includes("pocoes"))
          ) {
            cat.click();
          } else if (tipoItem === "bolas" && texto.includes("pokébolas")) {
            cat.click();
          }
        });

        setTimeout(() => {
          if (tipoItem === "pocoes") {
            executarCompraCard("i203", 800000, 1000, "Life Potions");
          } else {
            executarCompraCard("b4", 130000, 1000, "Pokébolas");
          }
        }, 500);
      }, 400);
    }, 500);
  } catch (err) {
    console.error("[PokéIdle Extension] Erro na compra:", err);

    fecharLoja();
  }
}

// EXECUTA COMPRA DO CARD

function executarCompraCard(chaveCard, precoTotal, quantidade, nomeItem) {
  const card = document.querySelector(`.mk-card[data-chave="${chaveCard}"]`);

  const moeda = document.querySelector(".mk-moeda");

  if (!card || !moeda) {
    fecharLoja();
    return;
  }

  const inputQuantidade = card.querySelector('input[type="number"]');

  const botaoComprar = card.querySelector(".mk-acao");

  const saldoAtual = parseInt(moeda.textContent.replace(/\D/g, ""), 10) || 0;

  if (saldoAtual < precoTotal || !inputQuantidade || !botaoComprar) {
    fecharLoja();
    return;
  }

  inputQuantidade.value = quantidade;

  inputQuantidade.dispatchEvent(
    new Event("input", {
      bubbles: true,
    }),
  );

  inputQuantidade.dispatchEvent(
    new Event("change", {
      bubbles: true,
    }),
  );

  botaoComprar.click();

  console.log(`[PokéIdle Extension] ${quantidade}x ${nomeItem} compradas!`);

  setTimeout(() => {
    fecharLoja();
  }, 800);
}

// FECHAR LOJA

function fecharLoja() {
  const btnFechar = document.getElementById("modal-fechar");

  if (btnFechar) {
    btnFechar.click();
  } else {
    const modal = document.getElementById("modal");

    if (modal) {
      modal.classList.add("hidden");
    }
  }

  setTimeout(() => {
    comprando = false;
  }, 1200);
}

// OBTER STATUS DA PÁGINA

function obterStatus() {
  const listaPoke = document.querySelectorAll(".lista-poke .poke-linha");

  let bolas = 0;

  const containerBolas = document.getElementById("auto-ball-opts");

  if (containerBolas) {
    const quantidades = containerBolas.querySelectorAll(".auto-chip .q");

    quantidades.forEach((elemento) => {
      bolas +=
        parseInt(elemento.textContent.replace(/\./g, "").trim(), 10) || 0;
    });
  }

  let pocoes = 0;

  const containerPocoes = document.getElementById("auto-potion-opts");

  if (containerPocoes) {
    const quantidades = containerPocoes.querySelectorAll(".auto-chip .q");

    quantidades.forEach((elemento) => {
      pocoes +=
        parseInt(elemento.textContent.replace(/\./g, "").trim(), 10) || 0;
    });
  }

  return {
    ativo: automacaoAtiva,
    equipe: listaPoke.length,
    bolas,
    pocoes,
  };
}

// IR PARA O CENTRO

function irParaCentro() {
  const btnIrCentro = document.getElementById("ir-centro");

  if (!btnIrCentro) {
    return {
      sucesso: false,
      erro: "Botão do Centro não encontrado.",
    };
  }

  if (btnIrCentro.disabled) {
    return {
      sucesso: false,
      erro: "Botão do Centro está desabilitado.",
    };
  }

  if (btnIrCentro.classList.contains("hidden")) {
    return {
      sucesso: false,
      erro: "Botão do Centro está oculto.",
    };
  }

  btnIrCentro.click();

  console.log("[PokéIdle Extension] Indo para o Centro Pokémon.");

  return {
    sucesso: true,
  };
}

// MENSAGENS DO POPUP

chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
  if (!mensagem || !mensagem.acao) {
    return;
  }

  // INICIAR

  if (mensagem.acao === "iniciar") {
    configuracao = {
      ...configuracao,
      ...mensagem.configuracao,
    };

    automacaoAtiva = true;

    console.log("[PokéIdle Extension] Automação iniciada.");

    sendResponse({
      sucesso: true,
      ativo: true,
    });

    return;
  }

  // PARAR

  if (mensagem.acao === "parar") {
    automacaoAtiva = false;
    comprando = false;

    console.log("[PokéIdle Extension] Automação parada.");

    sendResponse({
      sucesso: true,
      ativo: false,
    });

    return;
  }

  // ALTERAR CONFIGURAÇÃO

  if (mensagem.acao === "configurar") {
    configuracao = {
      ...configuracao,
      ...mensagem.configuracao,
    };

    sendResponse({
      sucesso: true,
    });

    return;
  }

  // OBTER STATUS

  if (mensagem.acao === "obterStatus") {
    sendResponse(obterStatus());
    return;
  }

  // IR PARA O CENTRO

  if (mensagem.acao === "irCentro") {
    sendResponse(irParaCentro());
    return;
  }

  // AÇÃO DESCONHECIDA

  sendResponse({
    sucesso: false,
    erro: "Ação desconhecida.",
  });
});
