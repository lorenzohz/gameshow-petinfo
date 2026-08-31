
# 🎰 Cassino Mágico   

Bem-vindo ao repositório do **Cassino Mágico**, uma atividade interativa desenvolvida para integrar os calouros dos cursos de Computação e Informática da Universidade Estadual de Maringá (UEM)! Aqui você encontrará tudo o que precisa para entender, apresentar e rodar a dinâmica.  

# 📖 Origem da Ideia  

A proposta do **Cassino Mágico** foi inicialmente concebida durante a Recepção de Calouros 2024, idealizada por:  

- **[Gabriel Libardi Lulu](https://github.com/gabriellibardi)**  
- **[Juliana Naomi Kawakami](https://github.com/juliana-kawakami)**  
- **[Matheus Cenerini Jacomini](https://github.com/Mathayuz)**  

Posteriormente, na Recepção de Calouros 2025, a ideia foi aprimorada e implementada por:  

## Colaboradores

- **[Gabriel Balancieri Perassoli](https://github.com/GabrielBalancieriPerassoli)**  
- **[Gabriel Libardi Lulu](https://github.com/gabriellibardi)**  
- **[Juliana Naomi Kawakami](https://github.com/juliana-kawakami)**  
- **[Matheus Cenerini Jacomini](https://github.com/Mathayuz)**  

## 📄 Documentação  

O repositório contém dois documentos essenciais para a atividade:  

- **Documentação Completa** (PDF) 📑 – Explica detalhadamente o contexto e as regras do jogo, incluindo a mecânica das fichas de poder e as etapas da dinâmica.  
- **Apresentação para os Participantes** 🎤 – Um material visual que pode ser utilizado para introduzir a atividade e orientar os jogadores antes do início do jogo.  

## 🚀 Como Rodar o Projeto  

Para executar o projeto localmente, siga os passos abaixo:  

```bash
npm install
npm run dev
```

Após iniciar o servidor, acesse o projeto no navegador através do link:

➡️ **[http://localhost:3000](http://localhost:3000)**  

## 🌍 Acesse o Deploy  

Se preferir, você pode visualizar o projeto já hospedado acessando:  
🔗 **[https://cassino-magico.vercel.app](https://cassino-magico.vercel.app)**  

---

# 🎤 Show do Quem Sabe Faz Ao Vivo (PET Informática 2026)

Esta branch adapta o Cassino Mágico para o processo seletivo do PET, com 4 equipes e roletas — tudo dentro do próprio site, sem depender de ferramentas externas. É um gameshow de perguntas e respostas tradicional (estilo Jeopardy): categorias, valores, timer e "acertou/errou" — sem cartas de poder.

## Fluxo de telas

- `/` — configuração das equipes (nomeia as 4 equipes; naipes fixos: ♣ Paus, ♥ Copas, ♠ Espadas, ♦ Ouros). Não existe mais splash screen.
- `/board` — tabuleiro principal: sorteio de quem começa, roleta de categoria, escolha do valor e placar
- `/question` — pergunta em si, com timer e botões de "acertou/errou" operados pelo host

Tudo é controlado manualmente pelo host em uma única tela/projetor (sem timers automáticos fora da resposta), como combinado.

## Identidade visual

Paleta em `tailwind.config.ts`: fundo off-white (`offwhite`), texto preto (`ink`) e azuis de destaque (`blue-deepest #10316b`, `blue-dark #214179`, `blue-primary #1961a5`, `blue-light #3788d1`), usados em cabeçalhos, botões e roletas com gradiente (classe `stage-gradient`). As 4 equipes têm cores próprias e variadas para se distinguirem do azul principal (verde, vermelho, roxo, âmbar) — em `src/lib/gameConfig.ts`, no array `DEFAULT_TEAMS`.

Tipografia: **Anton** para títulos/pontuações (efeito "placar de TV") e **Montserrat** para o resto do texto — ambas carregadas em `src/app/layout.tsx`.

As células do tabuleiro deixaram de ser hexágonos e viraram cards retangulares com cantos arredondados (classe utilitária `.stage-card` em `globals.css`).

## Como editar as perguntas

Todas as perguntas ficam em `src/app/data.json`, organizadas em 6 categorias (`din`, `jogos`, `musica`, `cinema`, `memes`, `geografia`) × 5 valores (200 a 1000). Os espaços em branco têm `"filled": false` — basta preencher `question`, `answer` (e `image`/`song`/`link` se for o caso) e trocar para `"filled": true`. Enquanto `filled` for `false`, a tela de pergunta mostra um aviso de "pergunta ainda não cadastrada" no lugar do texto.

## Mecânica do jogo

Tradicional, sem poderes: a equipe da vez gira a roleta de categoria, escolhe o valor da pergunta no tabuleiro e responde dentro do tempo. O host marca "acertou" (soma os pontos da pergunta ao placar da equipe) ou "errou" (nenhum ponto muda) e o jogo passa para a próxima equipe na ordem.

## Rodando localmente

```bash
npm install
npm run dev
```

