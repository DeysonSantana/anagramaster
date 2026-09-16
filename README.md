<div align="center">

# 🧩 AnagramMaster

**A Plataforma Definitiva de Desafios de Anagramas: 100% Offline-First, PWA, Google Sign-In e Multiplayer em Tempo Real.**

[![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-success?style=for-the-badge&logo=pwa)](https://github.com/DeysonSantana/anagramaster)
[![Firebase Auth](https://img.shields.io/badge/Auth-Google%20Sign--In-blue?style=for-the-badge&logo=firebase)](https://github.com/DeysonSantana/anagramaster)
[![Realtime Rooms](https://img.shields.io/badge/Multiplayer-Kahoot%20Style-red?style=for-the-badge&logo=google-cloud)](https://github.com/DeysonSantana/anagramaster)
[![Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-informational?style=for-the-badge&logo=soundcharts)](https://github.com/DeysonSantana/anagramaster)
[![Accessibility](https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-blueviolet?style=for-the-badge)](https://github.com/DeysonSantana/anagramaster)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Vanilla)-orange?style=for-the-badge)](https://github.com/DeysonSantana/anagramaster)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

*Decifre palavras embaralhadas, dispute salas em grupo com PIN e pódio ao vivo estilo Kahoot, encare a Palavra do Dia e compartilhe desafios instantaneamente via Link Atômico e QR Code.*

[🎯 Jogar Agora (Demo)](https://deysonsantana.github.io/anagramaster/) • [✨ Recursos](#-recursos-em-destaque) • [👥 Salas Multiplayer](#-salas-de-jogo-em-grupo-kahoot-style) • [🏗️ Arquitetura](#️-arquitetura-do-sistema) • [🚀 Como Executar](#-como-executar-localmente)

</div>

---

## 📖 Visão Geral

O **AnagramMaster** é uma Progressive Web Application (PWA) de alta performance concebida sob os mais rigorosos princípios de ergonomia visual, psicologia cognitiva e engenharia de software contemporânea. 

Inspirado na maturidade do **QuizMaster**, o AnagramMaster combina o melhor de dois mundos:
1. **Dual-Mode Data Layer**: Funciona **100% offline** via Service Worker e LocalStorage, e sincroniza em tempo real com **Google Firebase (Auth + Firestore)** ao detectar conexão.
2. **Multiplayer em Tempo Real**: Crie salas com PIN de 6 dígitos para turmas, amigos e eventos, com presença ao vivo no lobby, início sincronizado e pódio dinâmico (🥇, 🥈, 🥉).
3. **Responsividade Extrema**: Altura dinâmica de viewport (`100dvh`), suporte a safe area insets para entalhes de celular e redimensionamento fluido de letras (`clamp`).

---

## ✨ Recursos em Destaque

### 👥 1. Salas de Jogo em Grupo (Kahoot-Style)
* **PIN Exclusivo de 6 Dígitos**: O Host cria uma sala a partir de palavras aleatórias do dicionário ou digitando uma palavra secreta personalizada.
* **Lobby com Presença ao Vivo**: Escuta em tempo real (`onSnapshot`) dos participantes que entram, exibindo seus avatares emoji e contagem instantânea.
* **QR Code & Link Direto**: O Host projeta o QR Code gerado em Canvas ou compartilha a URL direta com fragmento `#room=PIN`.
* **Início Sincronizado**: Quando o Host clica em "Iniciar Partida", todos os participantes conectados iniciam a resolução do enigma juntos.
* **Pódio dos Campeões ao Vivo**: Conforme os competidores resolvem o anagrama, suas pontuações e tempos são gravados e o pódio (🥇 1º, 🥈 2º e 🥉 3º lugar) se reorganiza em tempo real na tela de todos.

---

### 🔐 2. Autenticação Google & Gestão de Contas (Firebase Auth)
* **Google Sign-In em 1 Clique**: Autenticação nativa via popup (`GoogleAuthProvider`).
* **Email & Senha**: Cadastro e login completos com validação de runtime.
* **Modo Convidado com Avatar Emoji**: Entre imediatamente sem cadastro escolhendo seu apelido e um avatar entre mais de 35 emojis lúdicos.
* **Header Interativo & Perfil**: Exibe o avatar e nome do usuário logado com menu de perfil e logout.

---

### 📱 3. Responsividade Extrema & Ergonomia Mobile
* **Dynamic Viewport Height (`100dvh`)**: Elimina barras de rolagem indesejadas e impede que menus do navegador cubram botões e tiles.
* **Tiles com Dimensionamento Fluido (`clamp(38px, 8.5vw, 54px)`)**: Adaptação perfeita desde telas compactas de 320px até tablets e monitores ultrawide.
* **Safe Area Insets**: Proteção para entalhes (notches) de iPhones e barras de navegação Android (`env(safe-area-inset-*)`).
* **Modo Paisagem Otimizado**: Layout proporcional para celulares virados na horizontal sem quebrar a visibilidade.

---

### 🎲 4. Modos de Jogo Solo & Dicionário
* **Modo Dicionário Offline**: Mais de 50 palavras curadas em Língua Portuguesa em 5 categorias:
  * 🎮 *Jogos & Geek*
  * 🌍 *Geografia & Cidades*
  * 🦁 *Reino Animal*
  * 🚀 *Ciência & Tecnologia*
  * 🍿 *Cinema & Séries*
* **📅 Palavra do Dia (Desafio Diário)**: Semente determinística (`seed = YYYY*1000 + MM*31 + DD`). Todos os jogadores enfrentam o mesmo desafio no mesmo dia.
* **✏️ Criador de Desafio Solo**: Compartilhe enigmas por link atômico comprimido com LZ-String sem precisar de banco de dados.

---

### 🔊 5. Sintetizador de Áudio Procedural (Web Audio API)
* **Zero Arquivos de Áudio Externos**: Não há downloads de arquivos `.mp3` ou `.ogg`.
* Efeitos sonoros sintetizados em runtime via osciladores senoidais, triangulares e dente de serra:
  * *Clique de letra selecionada*: Pop rápido de alta frequência.
  * *Retorno de letra ao rack*: Decaimento tonal descendente.
  * *Acerto da palavra*: Arpejo de acorde maior ascendente (C5 - E5 - G5 - C6).
  * *Erro de combinação*: Buzina harmônica com frequência amortecida.
  * *Vitória*: Fanfarra triunfal.
* Controle de mudo com persistência automática no `localStorage`.

---

### 🎨 6. Design Tokens & 5 Temas Visuais (WCAG 2.1 AA)
* Alternância fluida e persistente entre 5 paletas de cores refinadas:
  * 🔴 **Nintendo Retro**: Vermelho nintendo, azul mário e contraste limpo.
  * 🖤 **AMOLED Midnight**: Fundo preto puro para telas OLED e alta eficiência energética.
  * 🌲 **Emerald Forest**: Tons esmeralda e menta orgânicos.
  * 🌆 **Cyber Sunset**: Estética cyberpunk synthwave com tons púrpura e neon rose.
  * ⚪ **Clean Light**: Visual corporativo minimalista e elegante.
* Sincronização dinâmica da meta tag `<meta name="theme-color">` com a barra de status do sistema operacional mobile.

---

## 🏗️ Arquitetura do Sistema

A aplicação é estruturada como uma Single Page Application (SPA) modular em JavaScript Vanilla (ES6 Modules), com desacoplamento rigoroso entre domínio, infraestrutura serverless e apresentação:

```
anagramaster/
├── index.html                   # Shell semântico SPA, modais de Auth, Lobby e Pódio
├── manifest.json                # Manifesto PWA com ícones maskable
├── sw.js                        # Service Worker v4 (Cache-First + Limpeza Atômica)
├── assets/
│   └── icons/                   # Ícones PWA de 192x192 e 512x512
├── css/
│   ├── main.css                 # Layout 100dvh, clamp fluido, lobby e pódio
│   └── themes.css               # Design tokens das 5 paletas de temas
└── js/
    ├── app.js                   # Orquestrador central, ciclo de vida e teclado
    ├── firebaseConfig.js        # Conector serverless Firebase SDK (Auth + Firestore)
    ├── authManager.js           # Gerenciador de contas (Google Sign-In, Email, Guest)
    ├── roomManager.js           # Salas Multiplayer, PIN de 6 dígitos e Lobby ao vivo
    ├── leaderboardManager.js    # Pódio em tempo real (onSnapshot) 🥇🥈🥉
    ├── audio.js                 # Sintetizador procedural via Web Audio API
    ├── themeManager.js          # Gerenciador e persistência de temas visuais
    ├── anagramEngine.js         # Lógica de anagramas, Fisher-Yates e pontuação
    ├── dictionary.js            # Banco de palavras categorizado + Palavra do Dia
    ├── lzString.js              # Algoritmo de compressão de URLs LZ-String
    ├── qrcodeEngine.js          # Motor gráfico de QR Code em Canvas nativo (Types 1-40)
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

### Opção 1: Usando Node.js (npx serve)
```bash
git clone https://github.com/DeysonSantana/anagramaster.git
cd anagramaster
npx serve .
```

### Opção 2: Usando Python
```bash
python -m http.server 8000
```

### Opção 3: Usando a extensão Live Server (VS Code)
Abra a pasta no VS Code, clique com o botão direito sobre o arquivo `index.html` e selecione **"Open with Live Server"**.

Acesse no navegador: `http://localhost:8000` ou `http://127.0.0.1:5500`.

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Faça um Fork do projeto
2. Crie uma Branch para sua funcionalidade (`git checkout -b feature/nova-categoria`)
3. Faça o Commit de suas mudanças (`git commit -m 'feat: adiciona nova categoria'`)
4. Envie a Branch para o repositório remoto (`git push origin feature/nova-categoria`)
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte [`LICENSE`](LICENSE) para obter mais informações.

---

<div align="center">
Desenvolvido com excelência por <b>Deyson Santana</b> & <b>OmniCraft AI</b>.
</div>
