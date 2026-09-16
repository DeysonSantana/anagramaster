<div align="center">

# 🧩 AnagramMaster

**A Plataforma Definitiva de Desafios de Anagramas: 100% Offline-First, PWA e Serverless.**

[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-success?style=for-the-badge&logo=pwa)](https://github.com/DeysonSantana/anagramaster)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-informational?style=for-the-badge&logo=soundcharts)](https://github.com/DeysonSantana/anagramaster)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-blueviolet?style=for-the-badge)](https://github.com/DeysonSantana/anagramaster)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla)-orange?style=for-the-badge)](https://github.com/DeysonSantana/anagramaster)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*Decifre palavras embaralhadas, dispute o topo do ranking, encare a Palavra do Dia e compartilhe desafios instantaneamente via Link Atômico e QR Code sem depender de servidor.*

[🎯 Jogar Agora (Demo)](https://deysonsantana.github.io/anagramaster/) • [✨ Recursos](#-recursos-em-destaque) • [🏗️ Arquitetura](#️-arquitetura-do-sistema) • [🚀 Como Executar](#-como-executar-localmente)

</div>

---

## 📖 Visão Geral

O **AnagramMaster** é uma Progressive Web Application (PWA) de alta performance concebida sob os mais rigorosos princípios de ergonomia visual, psicologia cognitiva e engenharia de software contemporânea. 

Inspirado na arquitetura autônoma do **QuizMaster**, o AnagramMaster elimina completamente custos de infraestrutura de backend: todo o ciclo de vida da aplicação — desde o embaralhamento e validação até a síntese de áudio procedural e o compartilhamento de desafios com compressão LZ-String e QR Code em Canvas — é executado **100% no dispositivo do usuário (Client-Side)**.

---

## ✨ Recursos em Destaque

### 🎲 1. Modos de Jogo Completos
* **Modo Dicionário Offline**: Banco curado com mais de 50 palavras em português organizadas em 5 categorias:
  * 🎮 *Jogos & Geek* (Nintendo, PlayStation, Minecraft, Pikachu, etc.)
  * 🌍 *Geografia & Cidades* (Austrália, Portugal, Amazonas, etc.)
  * 🦁 *Reino Animal* (Camaleão, Ornitorrinco, Guepardo, etc.)
  * 🚀 *Ciência & Tecnologia* (Algoritmo, Telescópio, Criptografia, etc.)
  * 🍿 *Cinema & Séries* (Interestelar, Matrix, Gladiador, etc.)
* **📅 Palavra do Dia (Desafio Diário)**: Algoritmo de semente determinística baseado na data atual (`seed = YYYY*1000 + MM*31 + DD`). Todos os jogadores enfrentam o mesmo desafio no mesmo dia.
* **✏️ Criador de Desafios Customizados**: Defina sua própria palavra secreta, 2 dicas personalizadas e nome do autor para desafiar amigos e alunos.

---

### 🔗 2. Compartilhamento Atômico sem Servidor (Zero-Cost Sharing)
* **Compressão URI-Safe (LZ-String)**: Os dados do desafio `{word, hint1, hint2, creator}` são serializados, comprimidos e transmitidos diretamente pelo fragmento Hash da URL (`#c=PAYLOAD`). Não é necessário banco de dados para compartilhar.
* **Motor Nativo de QR Code em Canvas**: Gerador autônomo (Types 1 a 40) integrado em [`qrcodeEngine.js`](js/qrcodeEngine.js) que desenha o QR Code diretamente em um elemento `<canvas>` com zero dependência de APIs externas de terceiros.
* **Cópia Instantânea**: Integração com a `navigator.clipboard API` com feedback sonoro e visual imediato.

---

### 🔊 3. Sintetizador de Áudio Procedural (Web Audio API)
* **Zero Arquivos de Áudio Externos**: Não há downloads de arquivos `.mp3` ou `.ogg`.
* Efeitos sonoros sintetizados em tempo de execução via osciladores senoidais, triangulares e dente de serra:
  * *Clique de letra selecionada*: Pop rápido de alta frequência.
  * *Retorno de letra ao rack*: Decaimento tonal descendente.
  * *Acerto da palavra*: Arpejo de acorde maior ascendente (C5 - E5 - G5 - C6).
  * *Erro de combinação*: Buzina harmônica com frequência amortecida.
  * *Vitória*: Fanfarra triunfal.
* Controle de mudo com persistência automática no `localStorage`.

---

### 🎨 4. Design Tokens & 5 Temas Visuais (WCAG 2.1 AA)
* Alternância fluida e persistente entre 5 paletas de cores refinadas:
  * 🔴 **Nintendo Retro**: Vermelho nintendo, azul mário e contraste limpo.
  * 🖤 **AMOLED Midnight**: Fundo preto puro para telas OLED e alta eficiência energética.
  * 🌲 **Emerald Forest**: Tons esmeralda e menta orgânicos.
  * 🌆 **Cyber Sunset**: Estética cyberpunk synthwave com tons púrpura e neon rose.
  * ⚪ **Clean Light**: Visual corporativo minimalista e elegante.
* Sincronização dinâmica da meta tag `<meta name="theme-color">` com a barra de status do sistema operacional mobile.

---

### 🕹️ 5. Ergonomia de Montagem & Acessibilidade
* **Interação Tátil com Letras**: Clique nas peças do rack para montar a palavra nos slots superiores. Clique em qualquer letra preenchida para devolvê-la ao rack.
* **Suporte Completo a Teclado Físico**:
  * Digitação de qualquer caractere (A-Z com acentos automáticos).
  * <kbd>Backspace</kbd>: Desfaz a última letra inserida.
  * <kbd>Enter</kbd>: Submete e valida a resposta.
* **Contraste & ARIA**: Rótulos e anúncios semânticos para leitores de tela (`aria-live`, `role="alert"`, `role="region"`).
* **Toasts Flutuantes Não-Intrusivos**: Eliminação completa de caixas modais síncronas (`window.alert`).

---

### 🛡️ 6. Segurança e PWA Blindado
* **Proteção Estrita contra Stored XSS (OWASP A03)**: A listagem de ranking é renderizada exclusivamente por meio de nós DOM seguros (`textContent`), neutralizando tentativas de injeção de scripts maliciosos no nome do jogador.
* **Service Worker v3 com Política Cache-First**: O aplicativo instala e opera 100% offline, com descarte atômico de versões de cache obsoletas no evento `activate`.
* **Prompt Nativo de Instalação PWA**: Captura do evento `beforeinstallprompt` para disponibilizar o botão **📲 Instalar** no cabeçalho.

---

## 🏗️ Arquitetura do Sistema

A aplicação é estruturada como uma Single Page Application (SPA) em JavaScript Vanilla modular (ES6 Modules), isolando o domínio lógico da camada de apresentação:

```
anagramaster/
├── index.html                   # Shell semântico SPA e modais acessíveis
├── manifest.json                # Manifesto PWA com ícones maskable
├── sw.js                        # Service Worker (Cache-First + Stale-While-Revalidate)
├── assets/
│   └── icons/                   # Ícones PWA de 192x192 e 512x512
├── css/
│   ├── main.css                 # Layout responsivo, grid 8px, rack de tiles e animações
│   └── themes.css               # Design tokens das 5 paletas de temas
└── js/
    ├── app.js                   # Orquestrador central, ciclo de vida e teclado
    ├── audio.js                 # Sintetizador procedural via Web Audio API
    ├── themeManager.js          # Gerenciador e persistência de temas visuais
    ├── anagramEngine.js         # Lógica de anagramas, Fisher-Yates e pontuação
    ├── dictionary.js            # Banco de palavras categorizado + Palavra do Dia
    ├── lzString.js              # Algoritmo de compressão de URLs LZ-String
    ├── qrcodeEngine.js          # Motor gráfico de QR Code em Canvas nativo
    ├── shareManager.js          # Serialização atômica em hash (#c=...) e clipboard
    └── offlineManager.js        # Gerenciador PWA, conectividade e banner de instalação
```

---

## 📊 Mecânica de Pontuação

A pontuação de uma partida vitoriosa é calculada através de decaimento temporal ponderado:

$$\text{Pontuação} = \max\Big(100, \, 1000 - (\text{Segundos} \times 4) - (\text{Dicas Usadas} \times 200)\Big)$$

* **Base Máxima**: `1000` pontos.
* **Penalidade de Tempo**: `-4` pontos por segundo decorrido.
* **Penalidade de Dica**: `-200` pontos por dica revelada.
* **Piso de Vitória**: Mínimo garantido de `100` pontos ao decifrar.

---

## 🚀 Como Executar Localmente

Como o projeto é construído em puro Vanilla Web (sem dependência de bundlers pesados como Webpack ou Vite), você só precisa de um servidor HTTP estático para testar os módulos ES6 e o Service Worker:

### Opção 1: Usando Node.js (npx serve / http-server)
```bash
# Clone o repositório
git clone https://github.com/DeysonSantana/anagramaster.git

# Acesse a pasta
cd anagramaster

# Inicie um servidor local estático
npx serve .
# ou
npx http-server . -p 8080
```

### Opção 2: Usando Python
```bash
# Python 3
python -m http.server 8000
```

### Opção 3: Usando a extensão Live Server (VS Code)
Abra a pasta no VS Code, clique com o botão direito sobre o arquivo `index.html` e selecione **"Open with Live Server"**.

Acesse no navegador: `http://localhost:8000` ou `http://127.0.0.1:5500`.

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Sinta-se à vontade para enviar issues ou pull requests com novas palavras para o dicionário, temas visuais ou melhorias de acessibilidade.

1. Faça um Fork do projeto
2. Crie uma Branch para sua funcionalidade (`git checkout -b feature/nova-categoria`)
3. Faça o Commit de suas mudanças (`git commit -m 'feat: adiciona categoria Mitologia ao dicionário'`)
4. Envie a Branch para o repositório remoto (`git push origin feature/nova-categoria`)
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte [`LICENSE`](LICENSE) para obter mais informações.

---

<div align="center">
Desenvolvido com excelência por <b>Deyson Santana</b> & <b>OmniCraft AI</b>.
</div>
