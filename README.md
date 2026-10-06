# 🎮 PokéIdle Auto-Helper (Chrome Extension)

Uma extensão para Google Chrome desenvolvida para automatizar tarefas repetitivas no jogo **PokéIdle**, como captura de Pokémon caídos e reabastecimento automático de itens (Pokébolas e Poções).

---
**Nota:** Esta extensão encontra-se em **versão inicial (v0.1)**. Recursos adicionais e melhorias de estabilidade estão em desenvolvimento.

## 📌 Funcionalidades

- **Captura Automática de Pokémon Caídos:** Monitora a interface e clica automaticamente nos Pokémon caídos para realizar a captura, desde que a equipa não esteja cheia ($< 5$).
- **Seleção Automática de Pokébolas:** Mantém sempre selecionada a Pokébola mais forte disponível no inventário.
- **Compra Automática de Pokébolas:** Quando as Pokébolas chegam a zero, a extensão abre a loja, navega até à categoria correta e compra um lote de **1000 Pokébolas**.
- **Compra Automática de Poções:** Detecta quando **todos os slots de Poção** do painel (`auto-chip`) estão vazios, abrindo a loja na aba "Poções" para comprar **1000 Life Potions (Hyper Potion)**.
- ⏱️ **Garantia de Sincronia:** Possui mecanismos de bloqueio (`comprando = true`) e tempos de espera (`setTimeout`) para evitar loops infinitos, spams no console ou travamentos da interface durante as compras.

---

## 🛠️ Tecnologias Utilizadas

- **JavaScript (ES6+)** - Lógica principal de automação e manipulação do DOM.
- **Chrome Extension API (Manifest v3)** - Estrutura da extensão para execução de scripts de conteúdo.

---

## ⚙️ Como Instalar no Google Chrome

Como esta extensão é de uso pessoal/desenvolvimento, deve ser instalada no modo de desenvolvedor:

1. Faça o download ou clone este repositório para o seu computador:
   ```bash
   git clone [https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git](https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git)
