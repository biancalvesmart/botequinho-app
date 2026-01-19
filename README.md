# Botequinho - Companion App 🥘🍻

Este é o aplicativo de suporte (companion app) para o jogo de tabuleiro **Botequinho**, um projeto que celebra a culinária regional do Nordeste brasileiro. Desenvolvido como parte da trajetória acadêmica no curso de **Design Digital da UFC de Quixadá**, na disciplina de Arquitetura da Informação. O app gerencia a economia e os recursos dos jogadores durante a partida.

## ✨ Funcionalidades Principais

* **Lobby Multi-jogador**: Sistema de sincronização entre abas que permite de 2 a 4 jogadores na mesma sessão.
* **Gestão Financeira**: Sistema de saldo individual iniciado em 0 moedas, com recebimento de bônus por rodada e botão de estorno (devolver).
* **Transferências e Trocas**: Lógica de negociação entre jogadores para moedas ou ingredientes, com limite de uma transação por rodada.
* **Livro de Receitas Interativo**: Catálogo detalhado de pratos típicos (como Baião de Dois, Acarajé e Maria Isabel) com ingredientes e modo de preparo.
* **Mercado e Lojinha**: Compra de itens via mercado aberto (Prateleira), compra cega (Saco Surpresa) ou encomenda específica.

## 🎨 Identidade Visual e Design

O projeto utiliza uma estética de **Aquarela de Boteco**, buscando uma sensação orgânica e artesanal:
* **Paleta de Cores**: #FF3401 (Laranja-Vermelho), #FFCA1B (Amarelo Ouro), #0A9396 (Ciano) e #588A48 (Verde Folha).
* **Elementos Visuais**: Padrões de azulejos tradicionais e ilustrações de ingredientes feitas à mão.
* **Tipografia**: **Kalam** para títulos (estilo manuscrito) e **Radio Canada** para informações de leitura clara.

## 🛠️ Especificações Técnicas

O app foi construído utilizando tecnologias modernas de front-end para garantir rapidez e responsividade:
* **Framework**: React / Vite.
* **Sincronização**: Real-time via `localStorage` e `storage events` para testes multi-aba.
* **Estado Local**: Gerenciamento de sessão via `sessionStorage` para manter identidades únicas por aba.

### Como rodar o projeto localmente:
1. Instale as dependências: `npm install`.
2. Configure sua chave do Gemini em `.env.local`.
3. Inicie o servidor: `npm run dev`.

---
Desenvolvido por **Bianca Alves**.
