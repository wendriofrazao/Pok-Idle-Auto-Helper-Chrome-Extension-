# 🎮 PokéIdle Auto-Helper

Uma extensão para Google Chrome desenvolvida para automatizar tarefas repetitivas no jogo **PokéIdle**, oferecendo recursos para captura de Pokémon, gerenciamento da equipe, cura no Centro Pokémon e reabastecimento automático de Pokébolas e Poções.

A extensão possui um painel de controle próprio para ativar, desativar e configurar individualmente cada recurso da automação, além de exibir informações sobre o inventário e as estatísticas do jogador.

---

## 📌 Versão atual

**v2.5.0**

Esta versão aprimora o painel de controle, a comunicação entre o `popup.js` e o `content.js`, a exibição das estatísticas e o gerenciamento das informações do inventário.

##  Funcionalidades

###  Captura automática de Pokémon

* Monitora os Pokémon caídos disponíveis na interface do jogo.
* Realiza a captura automaticamente.
* Permite ativar ou desativar a funcionalidade pelo painel.

###  Cura automática

* Identifica quando o personagem está no Centro Pokémon.
* Verifica a disponibilidade da opção de cura.
* Executa a cura automaticamente quando habilitada.

###  Retorno automático ao Centro

* Monitora a quantidade de Pokémon na equipe.
* Quando a equipe atinge 5 Pokémon, verifica a disponibilidade do retorno ao Centro Pokémon.
* Executa o retorno automaticamente quando a ação está disponível.

###  Compra automática de Pokébolas

Quando o estoque de Pokébolas chega a zero, a extensão executa o fluxo de compra:

1. Abre a loja.
2. Acessa a aba de compra.
3. Localiza a categoria de Pokébolas.
4. Seleciona o item configurado.
5. Tenta comprar até 1.000 unidades, conforme o saldo disponível e as condições da loja.
6. Fecha a loja após a operação.

### 🧪 Compra automática de Poções

Quando o estoque de Poções está esgotado, a extensão:

1. Abre o Market.
2. Acessa a aba de compra.
3. Localiza a categoria de Poções.
4. Identifica o item configurado em `Life Potions`.
5. Tenta comprar até 1.000 unidades, conforme o saldo disponível e as condições da loja.
6. Fecha a loja após a operação.

###  Controle da automação

O painel permite controlar a execução das rotinas.

* **Iniciar automação:** ativa o processamento das rotinas habilitadas.
* **Parar automação:** interrompe a execução automática e impede o início de novas operações de compra.

###  Configurações individuais

É possível habilitar ou desabilitar individualmente:

* Captura de Pokémon.
* Cura automática.
* Retorno automático ao Centro.
* Compra automática de Pokébolas.
* Compra automática de Poções.

Assim, cada recurso pode ser utilizado conforme a necessidade do jogador.

###  Status e estatísticas

O painel apresenta informações sobre o estado da automação e os recursos do jogador.

* Status da automação.
* Quantidade de Pokébolas.
* Quantidade de Poções.
* Quantidade de Pokémon na equipe.
* Informações do inventário.
* Estatísticas disponíveis sobre os recursos monitorados.

O modal de estatísticas permite consultar essas informações e atualizar os dados exibidos.

###  Retorno manual ao Centro

O painel também disponibiliza a ação **Ir para o Centro**, permitindo acionar manualmente o retorno quando a funcionalidade estiver disponível no jogo.

### 📝 Sistema de logs

O painel registra eventos importantes da automação, como:

* Inicialização e parada.
* Alterações nas configurações.
* Tentativas de compra.
* Retorno ao Centro.
* Comunicação com a página do jogo.
* Erros encontrados durante a execução.

###  Comunicação entre painel e jogo

A extensão utiliza mensagens entre o `popup.js` e o `content.js` para consultar o estado da automação, recuperar informações do inventário e executar ações solicitadas pelo painel.

### 💾 Persistência das configurações

As configurações individuais são armazenadas com a Chrome Storage API, permitindo recuperar as preferências salvas quando o painel for aberto novamente.

---

##  Tecnologias utilizadas

* **JavaScript (ES6+)** — lógica da extensão, automação e manipulação do DOM.
* **HTML5** — estrutura do painel.
* **CSS3** — estilização e organização da interface.
* **Chrome Extension API** — integração com o navegador e comunicação com a página.
* **Manifest V3** — arquitetura da extensão para o Google Chrome.
* **Chrome Storage API** — armazenamento das configurações.

---

##  Estrutura do projeto

```text
pokeidle_auto-click/
│
├── manifest.json
├── content.js
├── popup.html
├── popup.css
├── popup.js
└── README.md
```

### `manifest.json`

Define as configurações da extensão, sua versão, permissões e integração com as páginas do PokéIdle.

### `content.js`

Responsável pela execução da automação dentro do jogo:

* Captura de Pokémon.
* Cura automática.
* Retorno ao Centro.
* Monitoramento de Pokébolas e Poções.
* Compra automática de itens.
* Consulta de informações do inventário.
* Recuperação de estatísticas.
* Comunicação com o painel.
* Controle do estado da automação.

### `popup.html`

Define a estrutura do painel de controle, incluindo botões, configurações, status, logs e modal de estatísticas.

### `popup.css`

Responsável pela aparência do painel, dos controles e das janelas de informações.

### `popup.js`

Gerencia as interações do usuário com o painel, a comunicação com o `content.js`, a atualização dos dados e a exibição das estatísticas.

---

## ⚙️ Como instalar no Google Chrome

A extensão pode ser instalada localmente pelo modo de desenvolvedor do Chrome.

### 1. Clone o repositório

```bash
git clone https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
```

Ou faça o download do projeto pelo GitHub.

### 2. Acesse a página de extensões

Abra o seguinte endereço no Chrome:

```text
chrome://extensions/
```

### 3. Ative o modo desenvolvedor

Ative a opção **Modo do desenvolvedor**, localizada no canto superior direito.

### 4. Carregue a extensão

Clique em **Carregar sem compactação** e selecione a pasta do projeto.

### 5. Abra o PokéIdle

Acesse:

https://pokeidle.io/

Entre no jogo e navegue até a página em que deseja utilizar a automação.

### 6. Abra o painel

Clique no ícone da extensão e abra o **PokéIdle Auto-Helper** para configurar as rotinas desejadas.

---

## 🚀 Como utilizar

1. Abra o PokéIdle.
2. Abra o painel da extensão.
3. Configure as rotinas que deseja utilizar.
4. Clique em **Iniciar automação**.
5. Acompanhe o estado da automação, o inventário e as estatísticas pelo painel.
6. Para interromper as rotinas, clique em **Parar automação**.

O funcionamento depende de o jogo estar aberto e dos elementos necessários estarem disponíveis na página.

---

## 🔒 Controle de segurança das compras

A extensão utiliza uma variável de controle para evitar a execução simultânea de operações de compra:

```javascript
let comprando = false;
```

Enquanto uma compra está em andamento, novas tentativas são bloqueadas. Intervalos de espera também são utilizados para permitir que a interface do jogo atualize os elementos necessários entre as etapas.

Esses mecanismos ajudam a reduzir operações duplicadas e problemas causados pelo carregamento da loja.

---

## 📦 Histórico de versões

### v2.5.0 — Melhorias no painel e nas estatísticas

* Aprimoramento do painel de controle.
* Correção da abertura e do fechamento do modal de estatísticas.
* Atualização das informações de inventário.
* Melhorias na comunicação entre `popup.js` e `content.js`.
* Exibição das estatísticas disponíveis do jogador.
* Ajustes na atualização dos dados de Pokébolas e Poções.
* Melhorias na sincronização entre configurações, inventário e painel.
* Ajustes gerais de estabilidade e usabilidade.

### v2.4.6 — Automação e gerenciamento pelo painel

* Novo painel de controle.
* Controles para iniciar e parar a automação.
* Configurações individuais para cada rotina.
* Captura automática de Pokémon.
* Cura automática no Centro Pokémon.
* Retorno automático ao Centro com a equipe cheia.
* Compra automática de Pokébolas.
* Compra automática de Poções.
* Exibição do status da equipe.
* Exibição do estoque de Pokébolas e Poções.
* Ação manual para ir ao Centro.
* Sistema de logs.
* Comunicação entre `popup.js` e `content.js`.
* Persistência das configurações com Chrome Storage.

**Funcionalidades removidas ou descontinuadas na versão 2.4.6:**

* Configuração automática de regiões.
* Seleção de áreas.
* Sistema de níveis para desbloqueio de regiões.
* Filtros por tipo de Pokémon.
* Automação baseada em região.

---

## 🗺️ Roadmap

Possíveis melhorias para versões futuras:

* [ ] Histórico detalhado de capturas.
* [ ] Configuração da quantidade de itens comprados.
* [ ] Limite mínimo de moedas para compras.
* [ ] Opções adicionais de gerenciamento da equipe.
* [ ] Sistema de notificações.
* [ ] Melhor gerenciamento de erros.
* [ ] Melhorias na interface do painel.
* [ ] Configurações avançadas de automação.
* [ ] Histórico de compras e consumo de itens.
* [ ] Estatísticas detalhadas de desempenho.

---

## ⚠️ Observações

* A extensão foi desenvolvida para uso com o jogo PokéIdle no Google Chrome.
* Os seletores e os fluxos de automação dependem da estrutura atual da interface do jogo.
* Alterações no site podem exigir ajustes no código.
* As compras automáticas dependem do saldo disponível e das condições estabelecidas pelo jogo.
* Utilize as rotinas automáticas de acordo com as regras e os termos de uso do jogo.

