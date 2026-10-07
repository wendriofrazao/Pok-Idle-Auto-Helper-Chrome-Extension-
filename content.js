console.log("[PokéIdle Extension] Carregada com sucesso!");

let comprando = false;

// LOOP PRINCIPAL (1 segundo)
setInterval(() => {
  const caidos = document.getElementById("caidos");
  const caido = document.querySelectorAll(".caido");
  const listaPoke = document.querySelectorAll(".lista-poke .poke-linha");
  const btnIrCentro = document.getElementById("ir-centro");
  const btnCurar = document.getElementById("centro-curar");

  // ROTINA DE CURA E RETORNO AO CENTRO
  // Se o botão de curar estiver visível no Centro Pokémon, clica para curar
  if (
    btnCurar &&
    !btnCurar.classList.contains("hidden") &&
    !btnCurar.classList.contains("fora")
  ) {
    btnCurar.click();
    console.log("[PokéIdle Extension] Equipe curada no Centro Pokémon!");
  }

  // Se a equipe estiver cheia (>= 5 Pokémon) e o botão "Ir ao Centro" estiver liberado
  if (listaPoke.length >= 5) {
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
  if (caidos && !caidos.classList.contains("m-aberto")) {
    caidos.classList.add("m-aberto");
  }

  caido.forEach((pokemon, index) => {
    setTimeout(() => {
      const listaAtual = document.querySelectorAll(".lista-poke .poke-linha");
      if (listaAtual.length >= 5) return;
      pokemon.click();
    }, index * 50);
  });

  // Se houver compra em andamento, pula as checagens abaixo
  if (comprando) return;

  // VERIFICAÇÃO DE POKÉBOLAS (#auto-ball-opts)
  const containerBolas = document.getElementById("auto-ball-opts");
  if (containerBolas) {
    const chipsBolas = containerBolas.querySelectorAll(".auto-chip");
    let totalBolas = 0;

    chipsBolas.forEach((chip) => {
      const qtdEl = chip.querySelector(".q");
      if (qtdEl) {
        const qtd = parseInt(qtdEl.textContent.replace(/\./g, "").trim()) || 0;
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

  // VERIFICAÇÃO DE POÇÕES (#auto-potion-opts)
  const containerPocoes = document.getElementById("auto-potion-opts");
  if (containerPocoes) {
    const chipsPocoes = containerPocoes.querySelectorAll(".auto-chip");
    let totalPocoes = 0;

    chipsPocoes.forEach((chip) => {
      const qtdEl = chip.querySelector(".q");
      if (qtdEl) {
        const qtd = parseInt(qtdEl.textContent.replace(/\./g, "").trim()) || 0;
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
}, 1000);

// FUNÇÕES DE COMPRA NO MARKET (MANTIDAS)
function comprarItem(tipoItem) {
  if (comprando) return;
  comprando = true;

  try {
    const modal = document.getElementById("modal");
    const btnMarket = document.querySelector('button[data-modal="market"]');

    if (modal && modal.classList.contains("hidden")) {
      if (btnMarket) btnMarket.click();
    }

    setTimeout(() => {
      const abas = document.querySelectorAll(".mk-aba");
      abas.forEach((aba) => {
        if (aba.dataset.aba === "compra") aba.click();
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

function executarCompraCard(chaveCard, precoTotal, quantidade, nomeItem) {
  const card = document.querySelector(`.mk-card[data-chave="${chaveCard}"]`);
  const moeda = document.querySelector(".mk-moeda");

  if (!card || !moeda) {
    fecharLoja();
    return;
  }

  const inputQuantidade = card.querySelector('input[type="number"]');
  const botaoComprar = card.querySelector(".mk-acao");
  const saldoAtual = parseInt(moeda.textContent.replace(/\D/g, "")) || 0;

  if (saldoAtual < precoTotal || !inputQuantidade || !botaoComprar) {
    fecharLoja();
    return;
  }

  inputQuantidade.value = quantidade;
  inputQuantidade.dispatchEvent(new Event("input", { bubbles: true }));
  inputQuantidade.dispatchEvent(new Event("change", { bubbles: true }));

  botaoComprar.click();
  console.log(`[PokéIdle Extension] ${quantidade}x ${nomeItem} compradas!`);

  setTimeout(fecharLoja, 800);
}

function fecharLoja() {
  const btnFechar = document.getElementById("modal-fechar");

  if (btnFechar) {
    btnFechar.click();
  } else {
    const modal = document.getElementById("modal");
    if (modal) modal.classList.add("hidden");
  }

  setTimeout(() => {
    comprando = false;
  }, 1200);
}
