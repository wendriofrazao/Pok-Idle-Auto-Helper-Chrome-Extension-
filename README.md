# 🎮 PokéIdle Auto-Helper

Uma extensão para Google Chrome desenvolvida para automatizar tarefas repetitivas no jogo **PokéIdle**, oferecendo recursos para captura de Pokémon, gerenciamento da equipe, cura no Centro Pokémon e reabastecimento automático de Pokébolas e Poções.

A extensão possui um painel de controle próprio para ativar, desativar e configurar individualmente cada recurso da automação.

---

## 📌 Versão atual

**v2.4.6**

Esta versão representa uma atualização da extensão para uma estrutura de produção, com um painel de controle integrado ao `content.js` e configurações individuais para cada rotina automática.

---

## ✨ Funcionalidades

### 🎯 Captura automática de Pokémon

A extensão monitora os Pokémon caídos disponíveis na interface e realiza a captura automaticamente.

O recurso pode ser ativado ou desativado individualmente pelo painel da extensão.

---

### 🏥 Cura automática

Quando o personagem está no Centro Pokémon e a opção de cura está disponível, a extensão identifica o botão de cura e realiza a ação automaticamente.

Pode ser ativada ou desativada pelo painel.

---

### 🏠 Retorno automático ao Centro

Quando a equipe atinge **5 Pokémon**, a extensão verifica se o botão de retorno ao Centro Pokémon está disponível.

Quando estiver liberado, o retorno é realizado automaticamente.

Essa função também pode ser desativada pelo painel.

---

### 🔴 Compra automática de Pokébolas

A extensão monitora a quantidade de Pokébolas disponíveis.

Quando o estoque chega a zero:

1. A loja é aberta automaticamente.
2. A aba de compra é selecionada.
3. A categoria de Pokébolas é localizada.
4. O item configurado é selecionado.
5. São realizadas tentativas de compra de **1000 Pokébolas**, desde que o saldo disponível seja suficiente.
6. A loja é fechada após a operação.

---

### 🧪 Compra automática de Poções

A extensão também monitora o estoque de Poções.

Quando as Poções estão esgotadas, a extensão:

1. Abre o Market.
2. Acessa a aba de compra.
3. Localiza a categoria de Poções.
4. Localiza o card configurado para `Life Potions`.
5. Tenta comprar **1000 unidades**.
6. Fecha a loja após a operação.

A compra somente é realizada quando o saldo disponível é suficiente.

---

### ⏯️ Controle da automação

O painel permite iniciar e parar a automação manualmente.

**Iniciar automação**

Ativa o loop principal responsável pelas rotinas configuradas.

**Parar automação**

Interrompe a execução automática e cancela novas operações de compra.

---

### ⚙️ Configurações individuais

Cada rotina pode ser controlada separadamente:

* Capturar Pokémon
* Curar Pokémon
* Voltar ao Centro
* Comprar Pokébolas
* Comprar Poções

Isso permite, por exemplo, utilizar somente a captura automática sem ativar as compras automáticas.

---

### 📊 Status da extensão

O painel apresenta informações básicas sobre o estado atual da automação:

* Status da automação
* Quantidade de Pokébolas
* Quantidade de Poções
* Quantidade de Pokémon na equipe

---

### 🏥 Ação manual de retorno ao Centro

Além do retorno automático, o painel possui uma ação manual:

**Ir para o Centro**

Quando o botão estiver disponível no jogo, a extensão pode acioná-lo diretamente.

---

### 📝 Sistema de logs

O painel possui uma área de logs para registrar as principais ações realizadas pela extensão, como:

* Inicialização da automação
* Parada da automação
* Alteração das configurações
* Retorno ao Centro
* Comunicação com o jogo

---

## 🛠️ Tecnologias utilizadas

* **JavaScript (ES6+)** — lógica da extensão, automação e manipulação do DOM.
* **HTML5** — estrutura do painel de controle.
* **CSS3** — estilização da interface.
* **Chrome Extension API** — comunicação entre popup e página.
* **Manifest V3** — estrutura atual da extensão para Google Chrome.
* **Chrome Storage API** — armazenamento das configurações da extensão.

---

## 📂 Estrutura do projeto

```text
pokeidle_auto-click/
│
├── manifest.json
│
├── content.js
│
├── popup.html
├── popup.css
├── popup.js
│
└── README.md
```

### `content.js`

Responsável pela automação dentro do PokéIdle.

Principais responsabilidades:

* Captura de Pokémon.
* Cura automática.
* Retorno ao Centro.
* Monitoramento de Pokébolas.
* Monitoramento de Poções.
* Compra automática de itens.
* Comunicação com o popup.
* Controle do estado da automação.

### `popup.html`

Define a estrutura visual do painel da extensão.

### `popup.css`

Responsável pela aparência e organização do painel de controle.

### `popup.js`

Responsável pela interação do usuário com o painel e pela comunicação com o `content.js`.

---

## ⚙️ Como instalar no Google Chrome

Como a extensão é destinada atualmente para uso pessoal e desenvolvimento, ela pode ser instalada utilizando o modo de desenvolvedor do Chrome.

### 1. Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
```

Ou faça o download do projeto pelo GitHub.

### 2. Abra as extensões do Chrome

No navegador, acesse:

```text
chrome://extensions/
```

### 3. Ative o modo desenvolvedor

No canto superior direito, ative:

```text
Modo do desenvolvedor
```

### 4. Carregue a extensão

Clique em:

```text
Carregar sem compactação
```

Selecione a pasta do projeto:

```text
pokeidle_auto-click/
```

### 5. Acesse o PokéIdle

Abra:

```text
https://pokeidle.io/
```

Entre no jogo e acesse a página onde a automação será utilizada.

### 6. Abra a extensão

Clique no ícone da extensão do Chrome e abra:

**PokéIdle Auto Helper**

A partir do painel será possível configurar e iniciar a automação.

---

## 🚀 Utilização

Depois de instalar a extensão:

1. Abra o PokéIdle.
2. Abra o **PokéIdle Auto Helper**.
3. Configure as funções desejadas.
4. Ative ou desative cada recurso conforme necessário.
5. Clique em **Iniciar automação**.
6. A extensão executará as rotinas configuradas enquanto o jogo estiver aberto.

Para interromper:

```text
Parar automação
```

---

## 🔒 Controle de segurança da automação

A extensão utiliza uma variável de controle para evitar que operações de compra sejam executadas simultaneamente:

```javascript
let comprando = false;
```

Durante uma compra, novas tentativas são bloqueadas até que a operação seja finalizada.

Também são utilizados intervalos de espera entre as etapas da compra para acompanhar o carregamento dos elementos da interface do jogo.

---

## 📦 Versão 2.4.6

### Novidades

* Novo painel de controle da extensão.
* Controle manual para iniciar e parar a automação.
* Configurações individuais para cada rotina.
* Captura automática de Pokémon.
* Cura automática no Centro Pokémon.
* Retorno automático ao Centro com equipe cheia.
* Compra automática de Pokébolas.
* Compra automática de Poções.
* Status da equipe.
* Status de Pokébolas.
* Status de Poções.
* Ação manual para ir ao Centro.
* Sistema de logs no painel.
* Comunicação entre `popup.js` e `content.js`.
* Persistência das configurações utilizando Chrome Storage.

### Removido

* Configuração automática de regiões.
* Seleção de áreas.
* Sistema de níveis para desbloqueio de regiões.
* Filtros de tipos de Pokémon.
* Automação baseada em região.

---

## 📌 Roadmap

Possíveis melhorias futuras:

* [ ] Histórico detalhado de capturas.
* [ ] Estatísticas da automação.
* [ ] Configuração da quantidade de itens comprados.
* [ ] Configuração de limite mínimo de moedas.
* [ ] Mais opções de gerenciamento da equipe.
* [ ] Sistema de notificações.
* [ ] Melhor gerenciamento de erros.
* [ ] Melhorias na interface do painel.
* [ ] Configurações avançadas de automação.



