/**
 * APP.JS - Orquestrador Central e Controlador da Aplicação (SPA)
 * Integração de Auth Firebase, Salas Multiplayer, Dicionário, Teclado e Ranking
 */

import { audio } from './audio.js';
import { themeManager } from './themeManager.js';
import { AnagramEngine } from './anagramEngine.js';
import { DictionaryManager, CATEGORIES } from './dictionary.js';
import { ShareManager } from './shareManager.js';
import { OfflineManager } from './offlineManager.js';
import { AuthManager } from './authManager.js';
import { LeaderboardManager } from './leaderboardManager.js';
import { RoomManager } from './roomManager.js';

class AnagramApp {
  constructor() {
    // Estado do Jogo
    this.currentChallenge = null;
    this.timerInterval = null;
    this.secondsElapsed = 0;
    this.hintsUsed = 0;
    this.finalScore = 0;

    // Estado dos Tiles
    this.rackLetters = [];   // Letras disponíveis { id, letter, used }
    this.placedLetters = []; // Letras inseridas nos slots { id, letter }

    // Telas
    this.screens = {
      hub: document.getElementById('hubScreen'),
      category: document.getElementById('categoryScreen'),
      creator: document.getElementById('creatorScreen'),
      game: document.getElementById('gameScreen'),
      gameOver: document.getElementById('gameOverScreen'),
      ranking: document.getElementById('rankingScreen'),
      roomLobbyScreen: document.getElementById('roomLobbyScreen'),
      roomPodiumScreen: document.getElementById('roomPodiumScreen')
    };

    // Managers
    this.offlineManager = new OfflineManager((msg, type) => this.showToast(msg, type));
    this.authManager = new AuthManager(this, (msg, type) => this.showToast(msg, type));
    this.leaderboardManager = new LeaderboardManager(this);
    this.roomManager = new RoomManager(this, this.authManager, this.leaderboardManager, (msg, type) => this.showToast(msg, type));
  }

  async init() {
    themeManager.init();
    this.offlineManager.init();
    await this.authManager.init();
    this.roomManager.init();
    this.setupGlobalEvents();
    this.setupThemeSelector();
    this.setupAudioToggle();
    this.loadRanking();

    // Checagem de Rotas por Hash (#room=... ou #c=...)
    const hash = window.location.hash;
    if (hash.startsWith('#room=')) {
      const pin = hash.substring(6).trim();
      if (pin) {
        this.roomManager.joinRoom(pin);
        return;
      }
    }

    const sharedChallenge = ShareManager.decodeFromHash();
    if (sharedChallenge) {
      this.showToast(`Desafio compartilhado por ${sharedChallenge.creator} recebido!`, 'success');
      this.startCustomGame(sharedChallenge);
    } else {
      this.switchScreen('hub');
    }
  }

  // --- NAVEGAÇÃO ENTRE TELAS ---
  switchScreen(screenName) {
    Object.keys(this.screens).forEach(key => {
      if (this.screens[key]) {
        this.screens[key].classList.add('hidden');
      }
    });

    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // --- SISTEMA DE TOASTS ACESSÍVEL ---
  showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- CONFIGURAÇÃO DE CONTROLES GLOBAIS ---
  setupThemeSelector() {
    const select = document.getElementById('themeSelect');
    if (select) {
      select.value = themeManager.getCurrentTheme();
      select.addEventListener('change', (e) => {
        themeManager.applyTheme(e.target.value);
        audio.playTileClick();
      });
    }
  }

  setupAudioToggle() {
    const btn = document.getElementById('btnToggleAudio');
    if (btn) {
      const updateIcon = (enabled) => {
        btn.innerHTML = enabled ? '🔊' : '🔇';
        btn.title = enabled ? 'Desativar Sons' : 'Ativar Sons';
        btn.setAttribute('aria-label', btn.title);
      };
      updateIcon(audio.isSoundEnabled());

      btn.addEventListener('click', () => {
        const enabled = audio.toggleSound();
        updateIcon(enabled);
      });
    }
  }

  setupGlobalEvents() {
    // Header Logo clique -> Volta ao Hub
    const logo = document.getElementById('brandLogo');
    if (logo) {
      logo.addEventListener('click', () => {
        if (this.timerInterval) this.stopTimer();
        this.switchScreen('hub');
        audio.playTileClick();
      });
    }

    // Hub Cards
    document.getElementById('hubBtnDictionary')?.addEventListener('click', () => {
      audio.playTileClick();
      this.switchScreen('category');
    });

    document.getElementById('hubBtnDaily')?.addEventListener('click', () => {
      audio.playTileClick();
      const daily = DictionaryManager.getDailyChallenge();
      this.startGame({
        secretWord: daily.word,
        hint1: daily.hint1,
        hint2: daily.hint2,
        category: daily.category,
        isDaily: true
      });
    });

    document.getElementById('hubBtnCreator')?.addEventListener('click', () => {
      audio.playTileClick();
      this.switchScreen('creator');
    });

    document.getElementById('hubBtnRanking')?.addEventListener('click', () => {
      audio.playTileClick();
      this.loadRanking();
      this.switchScreen('ranking');
    });

    // Categorias
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const catId = e.currentTarget.dataset.category;
        audio.playTileClick();
        const wordData = DictionaryManager.getByCategory(catId);
        this.startGame({
          secretWord: wordData.word,
          hint1: wordData.hint1,
          hint2: wordData.hint2,
          category: wordData.category
        });
      });
    });

    document.getElementById('btnBackFromCategories')?.addEventListener('click', () => {
      audio.playTileClick();
      this.switchScreen('hub');
    });

    document.getElementById('btnBackFromCreator')?.addEventListener('click', () => {
      audio.playTileClick();
      this.switchScreen('hub');
    });

    document.getElementById('btnBackFromRanking')?.addEventListener('click', () => {
      audio.playTileClick();
      this.switchScreen('hub');
    });

    // Criação de Desafio Personalizado Solo
    document.getElementById('btnSubmitCreation')?.addEventListener('click', () => {
      this.handleCreateCustomChallenge();
    });

    // Ações de Gameplay
    document.getElementById('btnShuffleRack')?.addEventListener('click', () => {
      this.shuffleAvailableRack();
    });

    document.getElementById('btnClearSlots')?.addEventListener('click', () => {
      this.clearAllSlots();
    });

    document.getElementById('btnBackspace')?.addEventListener('click', () => {
      this.removeLastPlacedLetter();
    });

    document.getElementById('btnSurrender')?.addEventListener('click', () => {
      this.endGame('giveup');
    });

    // Dicas
    document.getElementById('btnRevealHint1')?.addEventListener('click', () => {
      this.revealHint(1);
    });

    document.getElementById('btnRevealHint2')?.addEventListener('click', () => {
      this.revealHint(2);
    });

    // Input manual alternativo
    const manualInput = document.getElementById('manualAnswerInput');
    const manualSubmit = document.getElementById('btnSubmitManual');
    if (manualSubmit && manualInput) {
      const handleManual = () => {
        const val = manualInput.value.trim();
        if (!val) return;
        if (AnagramEngine.verifyAnswer(val, this.currentChallenge.secretWord)) {
          this.endGame('win');
        } else {
          audio.playError();
          this.showToast('Resposta incorreta! Tente novamente.', 'error');
          manualInput.value = '';
        }
      };
      manualSubmit.addEventListener('click', handleManual);
      manualInput.addEventListener('keyup', (e) => e.key === 'Enter' && handleManual());
    }

    // Modal de Compartilhamento Solo
    document.getElementById('btnCloseShareModal')?.addEventListener('click', () => {
      ShareManager.closeShareModal();
    });
    document.getElementById('copyShareUrlBtn')?.addEventListener('click', () => {
      ShareManager.copyShareUrl((msg, type) => this.showToast(msg, type));
    });

    // Fim de Jogo Solo
    document.getElementById('btnSaveRanking')?.addEventListener('click', () => {
      this.saveScore();
    });

    document.getElementById('btnShareChallenge')?.addEventListener('click', () => {
      ShareManager.showShareModal(this.currentChallenge);
    });

    document.getElementById('btnPlayAgain')?.addEventListener('click', () => {
      audio.playTileClick();
      this.switchScreen('hub');
    });

    // Teclado Físico para digitação direta
    window.addEventListener('keydown', (e) => {
      if (this.screens.game.classList.contains('hidden')) return;
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) return;

      const key = e.key.toUpperCase();
      if (key === 'BACKSPACE') {
        e.preventDefault();
        this.removeLastPlacedLetter();
      } else if (key === 'ENTER') {
        e.preventDefault();
        this.verifyCurrentPlacedAnswer();
      } else if (/^[A-ZÁÉÍÓÚÃÕÂÊÎÔÛÇ]$/.test(key)) {
        this.placeLetterByKey(key);
      }
    });
  }

  // --- LÓGICA DO CRIADOR DE DESAFIOS ---
  handleCreateCustomChallenge() {
    const wordInput = document.getElementById('customSecretWord');
    const hint1Input = document.getElementById('customHint1');
    const hint2Input = document.getElementById('customHint2');
    const creatorInput = document.getElementById('customCreatorName');

    const secretWord = wordInput.value.trim().toUpperCase();
    if (!secretWord || secretWord.length < 3) {
      audio.playError();
      this.showToast('A palavra secreta deve ter no mínimo 3 letras.', 'error');
      wordInput.focus();
      return;
    }

    const defaultCreator = this.authManager.getDisplayName() || 'Criador';
    const challenge = {
      secretWord,
      hint1: hint1Input.value.trim() || 'Nenhuma dica fornecida.',
      hint2: hint2Input.value.trim() || 'Nenhuma dica fornecida.',
      creator: creatorInput.value.trim() || defaultCreator,
      category: 'custom'
    };

    audio.playSuccess();
    this.showToast('Desafio criado com sucesso!', 'success');
    ShareManager.showShareModal(challenge);

    wordInput.value = '';
    hint1Input.value = '';
    hint2Input.value = '';
  }

  startCustomGame(challenge) {
    this.startGame(challenge);
  }

  // --- CICLO DE VIDA DO JOGO ---
  startGame(challenge) {
    this.currentChallenge = challenge;
    this.secondsElapsed = 0;
    this.hintsUsed = 0;
    this.placedLetters = [];

    // Metadados da tela
    const catBadge = document.getElementById('gameCategoryBadge');
    if (catBadge) {
      if (challenge.isRoomMatch) {
        catBadge.textContent = `👥 Sala #${challenge.roomPin}`;
      } else if (challenge.isDaily) {
        catBadge.textContent = '📅 Desafio do Dia';
      } else if (challenge.category && CATEGORIES[challenge.category]) {
        catBadge.textContent = `${CATEGORIES[challenge.category].icon} ${CATEGORIES[challenge.category].label}`;
      } else {
        catBadge.textContent = '✏️ Desafio Personalizado';
      }
    }

    // Reset de Dicas
    const h1Card = document.getElementById('hint1Card');
    const h2Card = document.getElementById('hint2Card');
    const h1Btn = document.getElementById('btnRevealHint1');
    const h2Btn = document.getElementById('btnRevealHint2');

    if (h1Card) {
      h1Card.classList.remove('revealed');
      h1Card.textContent = `Dica 1: ${challenge.hint1}`;
    }
    if (h2Card) {
      h2Card.classList.remove('revealed');
      h2Card.textContent = `Dica 2: ${challenge.hint2}`;
    }
    if (h1Btn) h1Btn.disabled = false;
    if (h2Btn) h2Btn.disabled = false;

    // Embaralhamento seguro
    const shuffledString = AnagramEngine.shuffle(challenge.secretWord);
    this.rackLetters = shuffledString.split('').map((char, index) => ({
      id: `tile_${index}_${char}`,
      letter: char,
      used: false
    }));

    this.renderSlots();
    this.renderRack();
    this.switchScreen('game');
    this.startTimer();
  }

  // --- RENDERIZAÇÃO DE SLOTS & TILES ---
  renderSlots() {
    const container = document.getElementById('targetSlotsContainer');
    if (!container) return;
    container.innerHTML = '';

    const wordLength = this.currentChallenge.secretWord.length;

    for (let i = 0; i < wordLength; i++) {
      const slot = document.createElement('button');
      slot.className = 'letter-slot empty';
      slot.setAttribute('aria-label', `Espaço ${i + 1} de ${wordLength}`);

      if (this.placedLetters[i]) {
        const item = this.placedLetters[i];
        slot.className = 'letter-slot filled';
        slot.textContent = item.letter;
        slot.setAttribute('aria-label', `Letra ${item.letter}. Clique para remover.`);
        slot.addEventListener('click', () => {
          this.removePlacedLetterAt(i);
        });
      }

      container.appendChild(slot);
    }
  }

  renderRack() {
    const container = document.getElementById('rackContainer');
    if (!container) return;
    container.innerHTML = '';

    this.rackLetters.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'letter-tile-btn';
      btn.textContent = item.letter;
      btn.disabled = item.used;
      btn.setAttribute('aria-label', `Letra ${item.letter}`);

      btn.addEventListener('click', () => {
        this.placeLetter(item);
      });

      container.appendChild(btn);
    });
  }

  // --- INTERAÇÃO DE TILES & TECLADO ---
  placeLetter(rackItem) {
    if (rackItem.used) return;
    if (this.placedLetters.length >= this.currentChallenge.secretWord.length) return;

    rackItem.used = true;
    this.placedLetters.push(rackItem);
    audio.playTileClick();

    this.renderSlots();
    this.renderRack();

    if (this.placedLetters.length === this.currentChallenge.secretWord.length) {
      setTimeout(() => this.verifyCurrentPlacedAnswer(), 120);
    }
  }

  placeLetterByKey(char) {
    const normChar = AnagramEngine.normalize(char);
    const availableItem = this.rackLetters.find(item => 
      !item.used && AnagramEngine.normalize(item.letter) === normChar
    );

    if (availableItem) {
      this.placeLetter(availableItem);
    } else {
      audio.playError();
    }
  }

  removePlacedLetterAt(index) {
    if (index < 0 || index >= this.placedLetters.length) return;

    const removedItem = this.placedLetters.splice(index, 1)[0];
    removedItem.used = false;
    audio.playTileReturn();

    this.renderSlots();
    this.renderRack();
  }

  removeLastPlacedLetter() {
    if (this.placedLetters.length === 0) return;
    this.removePlacedLetterAt(this.placedLetters.length - 1);
  }

  clearAllSlots() {
    if (this.placedLetters.length === 0) return;
    this.placedLetters.forEach(item => { item.used = false; });
    this.placedLetters = [];
    audio.playTileReturn();
    this.renderSlots();
    this.renderRack();
  }

  shuffleAvailableRack() {
    const available = this.rackLetters.filter(i => !i.used);
    if (available.length <= 1) return;

    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    let availIdx = 0;
    this.rackLetters = this.rackLetters.map(item => {
      if (!item.used) {
        return available[availIdx++];
      }
      return item;
    });

    audio.playTileClick();
    this.renderRack();
  }

  verifyCurrentPlacedAnswer() {
    const currentWord = this.placedLetters.map(i => i.letter).join('');
    if (AnagramEngine.verifyAnswer(currentWord, this.currentChallenge.secretWord)) {
      this.endGame('win');
    } else {
      audio.playError();
      const slots = document.getElementById('targetSlotsContainer');
      if (slots) {
        slots.classList.add('shake');
        setTimeout(() => slots.classList.remove('shake'), 400);
      }
      this.showToast('Combinação incorreta! Reorganize as letras.', 'error');
    }
  }

  // --- DICAS ---
  revealHint(hintNum) {
    const card = document.getElementById(`hint${hintNum}Card`);
    const btn = document.getElementById(`btnRevealHint${hintNum}`);

    if (card && !card.classList.contains('revealed')) {
      card.classList.add('revealed');
      this.hintsUsed++;
      audio.playTileClick();
      this.showToast(`Dica ${hintNum} revelada! (-200 pontos)`, 'warning');
      if (btn) btn.disabled = true;
    }
  }

  // --- TIMER ---
  startTimer() {
    this.stopTimer();
    const timerElem = document.getElementById('gameTimer');
    if (timerElem) timerElem.textContent = '00:00';

    this.timerInterval = setInterval(() => {
      this.secondsElapsed++;
      if (timerElem) {
        timerElem.textContent = AnagramEngine.formatTime(this.secondsElapsed);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // --- FINALIZAÇÃO DO JOGO ---
  endGame(status) {
    this.stopTimer();

    const isRoom = !!this.currentChallenge?.isRoomMatch;
    const roomPin = this.currentChallenge?.roomPin;

    const titleElem = document.getElementById('gameOverTitle');
    const msgElem = document.getElementById('gameOverMessage');
    const scoreElem = document.getElementById('finalScoreCounter');
    const solutionElem = document.getElementById('gameOverSolution');
    const nameInput = document.getElementById('rankingPlayerName');
    const saveBtn = document.getElementById('btnSaveRanking');
    const victoryIcon = document.getElementById('victoryIcon');

    if (solutionElem) {
      solutionElem.textContent = this.currentChallenge.secretWord;
    }

    if (status === 'win') {
      this.finalScore = AnagramEngine.calculateScore(this.secondsElapsed, this.hintsUsed);
      if (titleElem) titleElem.textContent = 'Parabéns, Você Decifrou!';
      if (msgElem) msgElem.textContent = `Você resolveu o anagrama em ${AnagramEngine.formatTime(this.secondsElapsed)} com ${this.hintsUsed} dica(s).`;
      if (victoryIcon) victoryIcon.textContent = '🎉';
      audio.playVictory();
    } else {
      this.finalScore = 0;
      if (titleElem) titleElem.textContent = 'Desafio Encerrado';
      if (msgElem) msgElem.textContent = 'Não desanime! Tente novamente no próximo enigma.';
      if (victoryIcon) victoryIcon.textContent = '💡';
      audio.playTileReturn();
    }

    // Se for partida multiplayer de sala, envia automaticamente a pontuação para a sala e abre o Pódio!
    if (isRoom && roomPin) {
      setTimeout(() => {
        this.roomManager.submitScore(roomPin, this.finalScore, this.secondsElapsed);
      }, 1200);
      return;
    }

    if (scoreElem) scoreElem.textContent = this.finalScore;
    if (nameInput) {
      nameInput.value = this.authManager.getDisplayName();
    }
    if (saveBtn) {
      saveBtn.disabled = this.finalScore === 0;
      saveBtn.textContent = 'Salvar no Ranking';
      saveBtn.classList.remove('btn-success');
    }

    this.switchScreen('gameOver');
  }

  // --- SISTEMA DE RANKING (IMUNE A XSS) ---
  loadRanking() {
    const lists = [document.getElementById('hubRankingList'), document.getElementById('fullRankingList')];
    const ranking = JSON.parse(localStorage.getItem('anagram_ranking') || '[]');

    lists.forEach(list => {
      if (!list) return;
      list.innerHTML = '';

      if (ranking.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'ranking-item';
        empty.textContent = 'Nenhuma pontuação registrada ainda.';
        empty.style.color = 'var(--text-secondary)';
        list.appendChild(empty);
        return;
      }

      ranking.slice(0, 10).forEach((entry, idx) => {
        const li = document.createElement('li');
        li.className = 'ranking-item';

        const spanPos = document.createElement('span');
        spanPos.className = 'ranking-pos';
        spanPos.textContent = `#${idx + 1}`;

        const spanName = document.createElement('span');
        spanName.className = 'ranking-name';
        spanName.textContent = entry.name;

        const spanScore = document.createElement('span');
        spanScore.className = 'ranking-score';
        spanScore.textContent = `${entry.score} pts`;

        li.appendChild(spanPos);
        li.appendChild(spanName);
        li.appendChild(spanScore);
        list.appendChild(li);
      });
    });
  }

  saveScore() {
    const input = document.getElementById('rankingPlayerName');
    const saveBtn = document.getElementById('btnSaveRanking');
    if (!input) return;

    const name = input.value.trim();
    if (!name) {
      audio.playError();
      this.showToast('Por favor, informe seu nome para registrar no ranking.', 'warning');
      input.focus();
      return;
    }

    let ranking = JSON.parse(localStorage.getItem('anagram_ranking') || '[]');
    ranking.push({
      name: name.substring(0, 15),
      score: this.finalScore,
      date: new Date().toISOString()
    });

    ranking.sort((a, b) => b.score - a.score);
    localStorage.setItem('anagram_ranking', JSON.stringify(ranking));

    audio.playSuccess();
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = '✓ Salvo com Sucesso!';
      saveBtn.classList.add('btn-success');
    }
    this.showToast('Pontuação gravada no Ranking!', 'success');
    this.loadRanking();
  }
}

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
  const app = new AnagramApp();
  app.init();
});
