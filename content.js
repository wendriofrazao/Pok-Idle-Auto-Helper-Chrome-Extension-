console.log("EXTENSÃO POKÉIDLE CARREGADA!");

let comprando = false;

// LOOP PRINCIPAL (1 segundo)
setInterval(() => {
  const caidos = document.getElementById("caidos");
  const bolasCaida = document.querySelectorAll(".caidos-bola");
  const caido = document.querySelectorAll(".caido");
  const listaPoke = document.querySelectorAll(".lista-poke");
  const timeCnt = document.getElementById("time-cnt");
  const autoChip = document.querySelectorAll(".auto-chip");

  const quantidadePokemon = listaPoke.length;

  if (quantidadePokemon >= 5) {
    return;
  }

  if (!timeCnt) return;

  const partesTempo = timeCnt.textContent.trim().split("/");
  const tempoAtual = parseInt(partesTempo[0]);
  const tempoTotal = parseInt(partesTempo[1]);

  if (isNaN(tempoAtual) || (partesTempo.length > 1 && isNaN(tempoTotal)))
    return;

  // Abrir lista de Pokémon caídos
  if (caidos && !caidos.classList.contains("m-aberto")) {
    caidos.classList.add("m-aberto");
  }

  // Selecionar última bola
  bolasCaida.forEach((bola) => bola.classList.remove("on"));
  const ultimaBola = bolasCaida[bolasCaida.length - 1];

  if (!ultimaBola) return;
  ultimaBola.classList.add("on");

  // Verificar quantidade de bolas
  const numeroBolas = ultimaBola.title?.split(" ");
  if (!numeroBolas) return;

  const quantidadeBolas = parseInt(numeroBolas[numeroBolas.length - 1]);
  if (isNaN(quantidadeBolas)) return;

  // Comprar Pokébolas se acabaram
  if (quantidadeBolas <= 0 && !comprando) {
    console.log("Pokébolas acabaram. Abrindo loja...");
    openModalNav();
  }

  // Capturar Pokémon caídos
  caido.forEach((pokemon, index) => {
    setTimeout(() => {
      const listaAtualizada = document.querySelectorAll(".lista-poke");
      if (listaAtualizada.length >= 5) return;

      const tempoAtualizado = document.getElementById("time-cnt");
      if (!tempoAtualizado) return;

      const partesAtualizadas = tempoAtualizado.textContent.trim().split("/");
      const tempoAtualNoClique = parseInt(partesAtualizadas[0]);

      if (!isNaN(tempoAtualNoClique) && tempoAtualNoClique >= 5) return;

      pokemon.click();
    }, index * 50);
  });

  // Verificar se TODOS os slots de poção estão vazios
  if (!comprando && autoChip.length > 0) {
    const todosVazios = Array.from(autoChip).every((chip) =>
      chip.classList.contains("vazio"),
    );

    if (todosVazios) {
      console.log("Todos os slots de poção estão vazios! Abrindo loja...");
      openModalLifePotion();
    }
  }
}, 1000);

// MÉTODOS DE COMPRA DE POÇÕES (LIFE POTION)
function openModalLifePotion() {
  if (comprando) return;
  comprando = true; // Trava para evitar requisições duplicadas

  const gaveta = document.getElementById("m-gaveta");
  const market = document.querySelector(".modal");
  const abas = document.querySelectorAll(".mk-aba");
  const categorias = document.querySelectorAll(".mk-cat");

  if (gaveta && !gaveta.classList.contains("aberta"))
    gaveta.classList.add("aberta");

  if (market && market.classList.contains("hidden"))
    market.classList.remove("hidden");

  // Simula o clique na aba Compra
  abas.forEach((aba) => {
    if (aba.dataset.aba === "compra") {
      aba.click();
    }
  });

  // Simula o clique na categoria Poções
  categorias.forEach((cat) => {
    const texto = cat.textContent.trim();
    if (texto.includes("Poções") || texto.includes("Pocoes")) {
      cat.click();
    }
  });

  // Aguarda 500ms para renderizar as poções no modal
  setTimeout(buyLifePotion, 500);
}

function buyLifePotion() {
  const card = document.querySelector('.mk-card[data-chave="i203"]');
  const moeda = document.querySelector(".mk-moeda");
  const precoMilLifePotion = 800000;

  if (!card || !moeda) {
    console.log("Card da poção ou saldo não encontrado. Fechando loja...");
    fecharLoja();
    return;
  }

  const inputQuantidade = card.querySelector('input[type="number"]');
  const botaoComprar = card.querySelector(".mk-acao");
  const saldoAtual = parseInt(moeda.textContent.replace(/\D/g, ""));

  if (saldoAtual < precoMilLifePotion || !inputQuantidade || !botaoComprar) {
    console.log("Saldo insuficiente ou elementos indisponíveis.");
    fecharLoja();
    return;
  }

  inputQuantidade.value = 1000;
  inputQuantidade.dispatchEvent(new Event("input", { bubbles: true }));
  inputQuantidade.dispatchEvent(new Event("change", { bubbles: true }));

  botaoComprar.click();
  console.log("1000 Life Potions (Hyper Potion) compradas!");

  setTimeout(fecharLoja, 800);
}

// MÉTODOS DE COMPRA DE POKÉBOLAS
function openModalNav() {
  if (comprando) return;
  comprando = true;

  const gaveta = document.getElementById("m-gaveta");
  const market = document.querySelector(".modal");
  const abas = document.querySelectorAll(".mk-aba");
  const categorias = document.querySelectorAll(".mk-cat");

  if (gaveta && !gaveta.classList.contains("aberta"))
    gaveta.classList.add("aberta");
  if (market && market.classList.contains("hidden"))
    market.classList.remove("hidden");

  abas.forEach((aba) => {
    if (aba.dataset.aba === "compra") aba.click();
  });

  categorias.forEach((categoria) => {
    if (categoria.textContent.trim().includes("Pokébolas")) categoria.click();
  });

  setTimeout(buyPokeBalls, 500);
}

function buyPokeBalls() {
  const card = document.querySelector('.mk-card[data-chave="b4"]');
  const moeda = document.querySelector(".mk-moeda");
  const precoMilBolas = 130000;

  if (!card || !moeda) {
    fecharLoja();
    return;
  }

  const inputQuantidade = card.querySelector('input[type="number"]');
  const botaoComprar = card.querySelector(".mk-acao");
  const saldoAtual = parseInt(moeda.textContent.replace(/\D/g, ""));

  if (saldoAtual < precoMilBolas || !inputQuantidade || !botaoComprar) {
    fecharLoja();
    return;
  }

  inputQuantidade.value = 1000;
  inputQuantidade.dispatchEvent(new Event("input", { bubbles: true }));
  inputQuantidade.dispatchEvent(new Event("change", { bubbles: true }));

  botaoComprar.click();
  console.log("1000 Pokébolas compradas!");

  setTimeout(fecharLoja, 800);
}

// AUXILIARES
function fecharLoja() {
  const market = document.querySelector(".modal");
  const gaveta = document.getElementById("m-gaveta");

  if (market) market.classList.add("hidden");
  if (gaveta) gaveta.classList.remove("aberta");

  liberarCompra();
}

function liberarCompra() {
  setTimeout(() => {
    comprando = false;
  }, 1000);
}
