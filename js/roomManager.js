/**
 * ROOMMANAGER.JS - Gerenciador de Salas Multiplayer em Tempo Real (Estilo Kahoot)
 * Criação com PIN de 6 dígitos, QR Code, Lobby com presença ao vivo e início sincronizado
 */

import { serverlessDB } from './firebaseConfig.js';
import { QRCodeRenderer } from './qrcodeEngine.js';
import { audio } from './audio.js';
import { DictionaryManager } from './dictionary.js';

export class RoomManager {
  constructor(app, authManager, leaderboardManager, onToast) {
    this.app = app;
    this.authManager = authManager;
    this.leaderboardManager = leaderboardManager;
    this.onToast = onToast || (() => {});

    this.currentRoom = null;
    this.isHost = false;
    this.unsubscribeRoom = null;
    this.unsubscribeParticipants = null;

    this.dom = {
      // Hub Quick Join
      hubPinInput: document.getElementById('hubPinInput'),
      btnHubJoinPin: document.getElementById('btnHubJoinPin'),
      hubBtnCreateRoom: document.getElementById('hubBtnCreateRoom'),

      // Create Room Modal
      createRoomModal: document.getElementById('createRoomModal'),
      btnCloseCreateRoom: document.getElementById('btnCloseCreateRoom'),
      roomTitleInput: document.getElementById('roomTitleInput'),
      roomWordModeSelect: document.getElementById('roomWordModeSelect'),
      roomCustomWordGroup: document.getElementById('roomCustomWordGroup'),
      roomCustomWordInput: document.getElementById('roomCustomWordInput'),
      roomCustomHint1Input: document.getElementById('roomCustomHint1Input'),
      roomCustomHint2Input: document.getElementById('roomCustomHint2Input'),
      btnConfirmCreateRoom: document.getElementById('btnConfirmCreateRoom'),

      // Lobby Screen
      roomLobbyScreen: document.getElementById('roomLobbyScreen'),
      lobbyPinDisplay: document.getElementById('lobbyPinDisplay'),
      lobbyQrCanvas: document.getElementById('lobbyQrCanvas'),
      lobbyDirectUrlInput: document.getElementById('lobbyDirectUrlInput'),
      btnCopyLobbyUrl: document.getElementById('btnCopyLobbyUrl'),
      lobbyParticipantsCount: document.getElementById('lobbyParticipantsCount'),
      lobbyParticipantsContainer: document.getElementById('lobbyParticipantsContainer'),
      btnHostStartGame: document.getElementById('btnHostStartGame'),
      lobbyWaitingStatus: document.getElementById('lobbyWaitingStatus'),
      btnLeaveLobby: document.getElementById('btnLeaveLobby')
    };

    this.bindEvents();
  }

  init() {
    this.checkUrlForRoomPin();
  }

  bindEvents() {
    // Abertura do Modal de Criar Sala
    this.dom.hubBtnCreateRoom?.addEventListener('click', () => {
      audio.playTileClick();
      this.openCreateRoomModal();
    });

    this.dom.btnCloseCreateRoom?.addEventListener('click', () => {
      this.closeCreateRoomModal();
    });

    // Toggle modo de palavra (Dicionário ou Customizada)
    this.dom.roomWordModeSelect?.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        this.dom.roomCustomWordGroup?.classList.remove('hidden');
      } else {
        this.dom.roomCustomWordGroup?.classList.add('hidden');
      }
    });

    // Confirmar criação da sala
    this.dom.btnConfirmCreateRoom?.addEventListener('click', async () => {
      await this.handleCreateRoom();
    });

    // Entrar por PIN no Hub
    this.dom.btnHubJoinPin?.addEventListener('click', async () => {
      const pin = this.dom.hubPinInput.value.trim();
      if (!pin || pin.length < 4) {
        audio.playError();
        this.onToast('Digite um PIN de sala válido.', 'warning');
        return;
      }
      await this.joinRoom(pin);
    });

    this.dom.hubPinInput?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.dom.btnHubJoinPin.click();
    });

    // Copiar URL da Sala no Lobby
    this.dom.btnCopyLobbyUrl?.addEventListener('click', async () => {
      const input = this.dom.lobbyDirectUrlInput;
      if (!input) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(input.value);
        } else {
          input.select();
          document.execCommand('copy');
        }
        audio.playSuccess();
        this.dom.btnCopyLobbyUrl.textContent = '✓ Copiado!';
        setTimeout(() => { this.dom.btnCopyLobbyUrl.textContent = 'Copiar Link'; }, 2000);
        this.onToast('Link de acesso da sala copiado!', 'success');
      } catch {
        this.onToast('Selecione e copie o link manualmente.', 'warning');
      }
    });

    // Host inicia a partida
    this.dom.btnHostStartGame?.addEventListener('click', async () => {
      await this.hostStartGame();
    });

    // Sair do Lobby
    this.dom.btnLeaveLobby?.addEventListener('click', () => {
      this.leaveRoom();
      this.app.switchScreen('hub');
      audio.playTileReturn();
    });
  }

  checkUrlForRoomPin() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#room=')) {
      const pin = hash.substring(6).trim();
      if (pin) {
        setTimeout(() => {
          this.joinRoom(pin);
        }, 500);
      }
    }
  }

  generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  openCreateRoomModal() {
    this.dom.createRoomModal?.classList.remove('hidden');
  }

  closeCreateRoomModal() {
    this.dom.createRoomModal?.classList.add('hidden');
  }

  async handleCreateRoom() {
    audio.playTileClick();
    const mode = this.dom.roomWordModeSelect.value;
    let secretWord = '';
    let hint1 = '';
    let hint2 = '';
    let category = 'group';

    if (mode === 'custom') {
      secretWord = this.dom.roomCustomWordInput.value.trim().toUpperCase();
      hint1 = this.dom.roomCustomHint1Input.value.trim() || 'Sem dica cadastrada.';
      hint2 = this.dom.roomCustomHint2Input.value.trim() || 'Sem dica cadastrada.';
      if (!secretWord || secretWord.length < 3) {
        audio.playError();
        this.onToast('A palavra secreta deve ter no mínimo 3 letras.', 'error');
        return;
      }
    } else {
      const randomWord = DictionaryManager.getRandomWord();
      secretWord = randomWord.word;
      hint1 = randomWord.hint1;
      hint2 = randomWord.hint2;
      category = randomWord.category;
    }

    const pin = this.generatePin();
    const user = this.authManager.getCurrentUser() || {
      uid: `host_${Date.now()}`,
      displayName: 'Host Organizador',
      avatarEmoji: '👑'
    };

    const roomData = {
      pin,
      title: this.dom.roomTitleInput.value.trim() || `Sala #${pin}`,
      hostId: user.uid,
      hostName: user.displayName,
      secretWord,
      hint1,
      hint2,
      category,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };

    this.currentRoom = roomData;
    this.isHost = true;

    // Salva sala no Firestore ou LocalStorage
    await this.saveRoomToDb(roomData);

    this.closeCreateRoomModal();
    this.showLobby(roomData, true);

    // Registra o Host como participante
    await this.addParticipantToRoom(pin, user);

    // Inicia ouvintes em tempo real
    this.listenToRoom(pin);
    this.listenToParticipants(pin);

    this.onToast(`Sala ${pin} criada com sucesso!`, 'success');
    audio.playSuccess();
  }

  async saveRoomToDb(roomData) {
    await serverlessDB.init();

    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomRef = doc(serverlessDB.firestore, 'anagram_rooms', roomData.pin);
        await setDoc(roomRef, roomData);
        return;
      } catch (e) {
        console.warn('[RoomManager] Erro ao salvar sala no Firestore:', e);
      }
    }

    // Fallback Local
    localStorage.setItem(`ANAGRAM_ROOM_${roomData.pin}`, JSON.stringify(roomData));
  }

  async joinRoom(pin) {
    audio.playTileClick();
    await serverlessDB.init();

    let room = await this.fetchRoom(pin);
    if (!room) {
      audio.playError();
      this.onToast(`Sala ${pin} não encontrada ou já expirada.`, 'error');
      return;
    }

    let user = this.authManager.getCurrentUser();
    if (!user) {
      // Se não tem usuário, cria convidado rápido
      const guestNick = prompt('Digite seu apelido para entrar na sala:') || `Jogador #${Math.floor(Math.random()*900 + 100)}`;
      this.authManager.signInAsGuest(guestNick, '🎮');
      user = this.authManager.getCurrentUser();
    }

    this.currentRoom = room;
    this.isHost = (user.uid === room.hostId);

    this.showLobby(room, this.isHost);
    await this.addParticipantToRoom(pin, user);

    this.listenToRoom(pin);
    this.listenToParticipants(pin);

    this.onToast(`Entrou na sala #${pin}!`, 'success');
  }

  async fetchRoom(pin) {
    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      try {
        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomRef = doc(serverlessDB.firestore, 'anagram_rooms', pin);
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          return snap.data();
        }
      } catch (e) {
        console.warn('[RoomManager] Erro ao buscar sala no Firestore:', e);
      }
    }

    // Fallback Local
    const local = localStorage.getItem(`ANAGRAM_ROOM_${pin}`);
    return local ? JSON.parse(local) : null;
  }

  async addParticipantToRoom(pin, user) {
    const participant = {
      userId: user.uid,
      nickname: user.displayName || 'Jogador',
      avatar: user.avatarEmoji || '👤',
      joinedAt: new Date().toISOString()
    };

    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const partRef = doc(serverlessDB.firestore, 'anagram_rooms', pin, 'participants', user.uid);
        await setDoc(partRef, participant);
        return;
      } catch (e) {
        console.warn('[RoomManager] Erro ao registrar participante no Firestore:', e);
      }
    }

    // Fallback Local
    const key = `ANAGRAM_ROOM_${pin}_PARTS`;
    const parts = JSON.parse(localStorage.getItem(key) || '[]');
    if (!parts.find(p => p.userId === user.uid)) {
      parts.push(participant);
      localStorage.setItem(key, JSON.stringify(parts));
    }
  }

  showLobby(room, isHost) {
    this.app.switchScreen('roomLobbyScreen');

    if (this.dom.lobbyPinDisplay) {
      this.dom.lobbyPinDisplay.textContent = room.pin;
    }

    // Monta URL direta
    const url = new URL(window.location.href);
    url.hash = `room=${room.pin}`;
    if (this.dom.lobbyDirectUrlInput) {
      this.dom.lobbyDirectUrlInput.value = url.toString();
    }

    // Gera QR Code Canvas
    if (this.dom.lobbyQrCanvas) {
      QRCodeRenderer.renderToCanvas(this.dom.lobbyQrCanvas, url.toString(), {
        size: 180,
        fgColor: '#000000',
        bgColor: '#ffffff'
      });
    }

    // Controle Host / Participante
    if (this.dom.btnHostStartGame && this.dom.lobbyWaitingStatus) {
      if (isHost) {
        this.dom.btnHostStartGame.classList.remove('hidden');
        this.dom.lobbyWaitingStatus.classList.add('hidden');
      } else {
        this.dom.btnHostStartGame.classList.add('hidden');
        this.dom.lobbyWaitingStatus.classList.remove('hidden');
      }
    }
  }

  listenToParticipants(pin) {
    if (this.unsubscribeParticipants) {
      this.unsubscribeParticipants();
      this.unsubscribeParticipants = null;
    }

    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js').then(({ collection, onSnapshot }) => {
        const partsRef = collection(serverlessDB.firestore, 'anagram_rooms', pin, 'participants');
        this.unsubscribeParticipants = onSnapshot(partsRef, (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push(doc.data()));
          this.renderParticipants(list);
        }, (err) => {
          console.warn('[RoomManager] Erro no onSnapshot participants:', err);
          this.fallbackLocalParticipants(pin);
        });
      }).catch(() => this.fallbackLocalParticipants(pin));
    } else {
      this.fallbackLocalParticipants(pin);
    }
  }

  fallbackLocalParticipants(pin) {
    const key = `ANAGRAM_ROOM_${pin}_PARTS`;
    const parts = JSON.parse(localStorage.getItem(key) || '[]');
    this.renderParticipants(parts);
  }

  renderParticipants(list) {
    if (this.dom.lobbyParticipantsCount) {
      this.dom.lobbyParticipantsCount.textContent = list.length;
    }
    if (this.dom.lobbyParticipantsContainer) {
      this.dom.lobbyParticipantsContainer.innerHTML = '';
      list.forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'participant-chip';
        chip.innerHTML = `
          <span class="participant-avatar">${p.avatar || '👤'}</span>
          <span class="participant-name">${p.nickname || 'Jogador'}</span>
        `;
        this.dom.lobbyParticipantsContainer.appendChild(chip);
      });
    }
  }

  listenToRoom(pin) {
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom();
      this.unsubscribeRoom = null;
    }

    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js').then(({ doc, onSnapshot }) => {
        const roomRef = doc(serverlessDB.firestore, 'anagram_rooms', pin);
        this.unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
          if (!snapshot.exists()) return;
          const data = snapshot.data();
          this.currentRoom = data;

          // Se a sala mudou de status para 'playing', inicia a partida para todos
          if (data.status === 'playing') {
            this.launchRoomGame(data);
          }
        });
      });
    }
  }

  async hostStartGame() {
    if (!this.currentRoom || !this.isHost) return;
    audio.playTileClick();

    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      try {
        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const roomRef = doc(serverlessDB.firestore, 'anagram_rooms', this.currentRoom.pin);
        await updateDoc(roomRef, { status: 'playing' });
        return;
      } catch (e) {
        console.warn('[RoomManager] Erro ao iniciar partida no Firestore:', e);
      }
    }

    // Fallback local
    this.currentRoom.status = 'playing';
    this.launchRoomGame(this.currentRoom);
  }

  launchRoomGame(room) {
    this.onToast('A partida começou! Decifre o anagrama o mais rápido possível!', 'success');
    audio.playSuccess();

    this.app.startGame({
      secretWord: room.secretWord,
      hint1: room.hint1,
      hint2: room.hint2,
      category: room.category,
      isRoomMatch: true,
      roomPin: room.pin
    });
  }

  /**
   * Salva a pontuação do jogador na subcoleção de scores da sala
   */
  async submitScore(pin, score, timeSeconds) {
    const user = this.authManager.getCurrentUser() || {
      uid: `player_${Date.now()}`,
      displayName: 'Jogador',
      avatarEmoji: '🧩'
    };

    const scoreData = {
      userId: user.uid,
      nickname: user.displayName,
      avatar: user.avatarEmoji || '👤',
      score,
      timeSeconds,
      submittedAt: new Date().toISOString()
    };

    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      try {
        const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const scoreRef = doc(serverlessDB.firestore, 'anagram_rooms', pin, 'scores', user.uid);
        await setDoc(scoreRef, scoreData);
      } catch (e) {
        console.warn('[RoomManager] Erro ao gravar pontuação no Firestore:', e);
      }
    }

    // Fallback Local
    const key = `ANAGRAM_ROOM_${pin}_SCORES`;
    const scores = JSON.parse(localStorage.getItem(key) || '[]');
    scores.push(scoreData);
    localStorage.setItem(key, JSON.stringify(scores));

    // Abre o Pódio com escuta em tempo real
    this.app.switchScreen('roomPodiumScreen');
    this.leaderboardManager.startListening(pin, this.isHost);
  }

  leaveRoom() {
    if (this.unsubscribeRoom) {
      this.unsubscribeRoom();
      this.unsubscribeRoom = null;
    }
    if (this.unsubscribeParticipants) {
      this.unsubscribeParticipants();
      this.unsubscribeParticipants = null;
    }
    this.currentRoom = null;
    this.isHost = false;
  }
}
