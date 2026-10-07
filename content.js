console.log("[PokéIdle Extension] Carregada com sucesso!");

let comprando = false;

// loop principal (1 segundo)
setInterval(() => {
  const caidos = document.getElementById("caidos");
  const bolasCaida = document.querySelectorAll(".caidos-bola");
  const caido = document.querySelectorAll(".caido");
  const listaPoke = document.querySelectorAll(".lista-poke");
  const timeCnt = document.getElementById("time-cnt");

  // Se o time estiver cheio (>= 5), interrompe capturas
  if (listaPoke.length >= 5) return;

  // 1. abrir e selecionar o pokemon caido
  if (caidos && !caidos.classList.contains("m-aberto")) {
    caidos.classList.add("m-aberto");
  }

  // Capturar caídos
  caido.forEach((pokemon, index) => {
    setTimeout(() => {
      const listaAtualizada = document.querySelectorAll(".lista-poke");
      if (listaAtualizada.length >= 5) return;
      pokemon.click();
    }, index * 50);
  });

  // Se já houver um processo de compra rodando, encerra a checagem aqui
  if (comprando) return;

  // 2. VERIFICAÇÃO DE POKÉBOLAS (#auto-ball-opts)
  const containerBolas = document.getElementById("auto-ball-opts");
  if (containerBolas) {
    const chipsBolas = containerBolas.querySelectorAll(".auto-chip");
    let totalBolas = 0;

    chipsBolas.forEach((chip) => {
      const qtdEl = chip.querySelector(".q");
      if (qtdEl) {
        // Remove pontos de milhar (ex: "1.022" -> 1022)
        const qtd = parseInt(qtdEl.textContent.replace(/\./g, "").trim()) || 0;
        totalBolas += qtd;
      }
    });

    if (totalBolas <= 0) {
      console.log(
        "[PokéIdle Extension] Pokébolas esgotadas! Abrindo Market...",
      );
      openModalNav();
      return;
    }
  }

  // 3. VERIFICAÇÃO DE POÇÕES (#auto-potion-opts)
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
        "[PokéIdle Extension] Todas as poções acabaram! Abrindo Market...",
      );
      openModalLifePotion();
      return;
    }
  }
}, 1000);

// MÉTODOS DE COMPRA NA LOJA (MARKET)
// --- compra as porções ---
function openModalLifePotion() {
  if (comprando) return;
  comprando = true;

  const btnMarket = document.querySelector('button[data-modal="market"]');
  if (btnMarket) btnMarket.click();

  setTimeout(() => {
    // Transiciona para a aba "Compra"
    const abas = document.querySelectorAll(".mk-aba");
    abas.forEach((aba) => {
      if (aba.dataset.aba === "compra") aba.click();
    });

    setTimeout(() => {
      // Clica na categoria "Poções"
      const categorias = document.querySelectorAll(".mk-cat");
      categorias.forEach((cat) => {
        const texto = cat.textContent.trim();
        if (texto.includes("Poções") || texto.includes("Pocoes")) {
          cat.click();
        }
      });

      // Executa a compra após a renderização dos cards
      setTimeout(buyLifePotion, 500);
    }, 400);
  }, 400);
}

function buyLifePotion() {
  const card = document.querySelector('.mk-card[data-chave="i203"]');
  const moeda = document.querySelector(".mk-moeda");
  const precoMilLifePotion = 800000;

  if (!card || !moeda) {
    console.warn("[PokéIdle Extension] Card da poção não encontrado.");
    fecharLoja();
    return;
  }

  const inputQuantidade = card.querySelector('input[type="number"]');
  const botaoComprar = card.querySelector(".mk-acao");
  const saldoAtual = parseInt(moeda.textContent.replace(/\D/g, "")) || 0;

  if (saldoAtual < precoMilLifePotion || !inputQuantidade || !botaoComprar) {
    console.warn(
      "[PokéIdle Extension] Saldo insuficiente ou botão indisponível.",
    );
    fecharLoja();
    return;
  }

  inputQuantidade.value = 1000;
  inputQuantidade.dispatchEvent(new Event("input", { bubbles: true }));
  inputQuantidade.dispatchEvent(new Event("change", { bubbles: true }));

  botaoComprar.click();
  console.log("[PokéIdle Extension] 1000 Life Potions compradas!");

  setTimeout(fecharLoja, 800);
}

// compra as pokebolas
function openModalNav() {
  if (comprando) return;
  comprando = true;

  const btnMarket = document.querySelector('button[data-modal="market"]');
  if (btnMarket) btnMarket.click();

  setTimeout(() => {
    const abas = document.querySelectorAll(".mk-aba");
    abas.forEach((aba) => {
      if (aba.dataset.aba === "compra") aba.click();
    });

    setTimeout(() => {
      const categorias = document.querySelectorAll(".mk-cat");
      categorias.forEach((cat) => {
        if (cat.textContent.trim().includes("Pokébolas")) {
          cat.click();
        }
      });

      setTimeout(buyPokeBalls, 500);
    }, 400);
  }, 400);
}

function buyPokeBalls() {
  const card = document.querySelector('.mk-card[data-chave="b4"]');
  const moeda = document.querySelector(".mk-moeda");
  const precoMilBolas = 130000;

  if (!card || !moeda) {
    console.warn("[PokéIdle Extension] Card de Pokébolas não encontrado.");
    fecharLoja();
    return;
  }

  const inputQuantidade = card.querySelector('input[type="number"]');
  const botaoComprar = card.querySelector(".mk-acao");
  const saldoAtual = parseInt(moeda.textContent.replace(/\D/g, "")) || 0;

  if (saldoAtual < precoMilBolas || !inputQuantidade || !botaoComprar) {
    fecharLoja();
    return;
  }

  inputQuantidade.value = 1000;
  inputQuantidade.dispatchEvent(new Event("input", { bubbles: true }));
  inputQuantidade.dispatchEvent(new Event("change", { bubbles: true }));

  botaoComprar.click();
  console.log("[PokéIdle Extension] 1000 Pokébolas compradas!");

  setTimeout(fecharLoja, 800);
}

// --- AUXILIARES ---
function fecharLoja() {
  const btnFechar = document.getElementById("modal-fechar");

  if (btnFechar) {
    btnFechar.click();
  } else {
    const btnMarket = document.querySelector('button[data-modal="market"]');
    if (btnMarket) btnMarket.click();
  }

  liberarCompra();
}

function liberarCompra() {
  setTimeout(() => {
    comprando = false;
  }, 1000);
}
