/**
 * AUTHMANAGER.JS - Gerenciador de Autenticação e Contas de Usuário
 * Suporte nativo a Google Sign-In, Email/Senha e Modo Convidado com Avatar Emoji
 */

import { serverlessDB } from './firebaseConfig.js';
import { audio } from './audio.js';

const STORAGE_SESSION_USER = 'ANAGRAM_SESSION_USER';

export const AVATAR_EMOJIS = [
  '🎓', '🧠', '🧩', '🔬', '💡', '🎨', '🚀', '🛸',
  '🌟', '⚡', '🤖', '👾', '🔮', '🦁', '🦊', '🐯',
  '🐼', '🦉', '🦖', '🐙', '🐬', '🦄', '👑', '🧙‍♂️',
  '🥷', '🦸', '🎮', '💎', '🛡️', '⚔️', '🎯', '🏆',
  '🔥', '🐱', '🐶', '🍕', '☕', '🎸', '🕹️', '🥇'
];

export class AuthManager {
  constructor(app, onToast) {
    this.app = app;
    this.onToast = onToast || (() => {});
    this.currentUser = this.loadSessionUser();
    this.selectedGuestEmoji = '🧩';
    this.isRegisterMode = false;

    this.dom = {
      // Header Elements
      headerAuthBtn: document.getElementById('headerAuthBtn'),
      headerUserProfileBtn: document.getElementById('headerUserProfileBtn'),
      headerUserAvatar: document.getElementById('headerUserAvatar'),
      headerUserName: document.getElementById('headerUserName'),

      // Auth Modal
      authModal: document.getElementById('authModal'),
      btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
      authModalTitle: document.getElementById('authModalTitle'),
      authForm: document.getElementById('authForm'),
      authNameGroup: document.getElementById('authNameGroup'),
      authNameInput: document.getElementById('authNameInput'),
      authEmailInput: document.getElementById('authEmailInput'),
      authPasswordInput: document.getElementById('authPasswordInput'),
      authSubmitBtn: document.getElementById('authSubmitBtn'),
      authToggleModeBtn: document.getElementById('authToggleModeBtn'),
      btnGoogleAuth: document.getElementById('btnGoogleAuth'),
      btnGuestAuth: document.getElementById('btnGuestAuth'),
      authErrorMsg: document.getElementById('authErrorMsg'),

      // Guest Setup Modal
      guestModal: document.getElementById('guestSetupModal'),
      btnCloseGuestModal: document.getElementById('btnCloseGuestModal'),
      guestNicknameInput: document.getElementById('guestNicknameInput'),
      guestAvatarPreview: document.getElementById('guestAvatarPreview'),
      guestEmojiGrid: document.getElementById('guestEmojiGrid'),
      btnConfirmGuest: document.getElementById('btnConfirmGuest'),

      // User Profile Modal
      profileModal: document.getElementById('userProfileModal'),
      btnCloseProfileModal: document.getElementById('btnCloseProfileModal'),
      profileDisplayName: document.getElementById('profileDisplayName'),
      profileEmail: document.getElementById('profileEmail'),
      profileAvatarDisplay: document.getElementById('profileAvatarDisplay'),
      profileEmojiGrid: document.getElementById('profileEmojiGrid'),
      btnLogout: document.getElementById('btnLogout')
    };
  }

  async init() {
    this.bindEvents();
    this.renderEmojiGrids();
    this.updateUI();

    // Conecta ao Firebase em segundo plano
    const connected = await serverlessDB.init();
    if (connected && serverlessDB.auth) {
      try {
        const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        onAuthStateChanged(serverlessDB.auth, (user) => {
          if (user) {
            this.currentUser = {
              uid: user.uid,
              displayName: user.displayName || user.email.split('@')[0],
              email: user.email,
              photoURL: user.photoURL,
              isGuest: false,
              avatarEmoji: this.currentUser?.avatarEmoji || '🧩'
            };
            this.saveSessionUser(this.currentUser);
          } else if (this.currentUser && !this.currentUser.isGuest) {
            this.currentUser = null;
            this.saveSessionUser(null);
          }
          this.updateUI();
        });
      } catch (e) {
        console.warn('[AuthManager] Falha ao registrar observador de auth:', e);
      }
    }
  }

  loadSessionUser() {
    try {
      const data = localStorage.getItem(STORAGE_SESSION_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  saveSessionUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_SESSION_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_SESSION_USER);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getDisplayName() {
    return this.currentUser ? this.currentUser.displayName : 'Jogador';
  }

  getAvatar() {
    if (this.currentUser) {
      return this.currentUser.avatarEmoji || '🧩';
    }
    return '👤';
  }

  bindEvents() {
    // Header Triggers
    this.dom.headerAuthBtn?.addEventListener('click', () => {
      audio.playTileClick();
      this.openAuthModal();
    });

    this.dom.headerUserProfileBtn?.addEventListener('click', () => {
      audio.playTileClick();
      this.openProfileModal();
    });

    // Fechar Modais
    this.dom.btnCloseAuthModal?.addEventListener('click', () => this.closeAuthModal());
    this.dom.btnCloseGuestModal?.addEventListener('click', () => this.closeGuestModal());
    this.dom.btnCloseProfileModal?.addEventListener('click', () => this.closeProfileModal());

    // Toggle Login / Cadastro
    this.dom.authToggleModeBtn?.addEventListener('click', () => {
      this.isRegisterMode = !this.isRegisterMode;
      this.renderAuthMode();
    });

    // Submissão de Formulário Email/Senha
    this.dom.authForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleEmailAuth();
    });

    // Botão Google Sign-In
    this.dom.btnGoogleAuth?.addEventListener('click', async () => {
      await this.handleGoogleAuth();
    });

    // Botão Convidado
    this.dom.btnGuestAuth?.addEventListener('click', () => {
      this.closeAuthModal();
      this.openGuestModal();
    });

    // Confirmar Convidado
    this.dom.btnConfirmGuest?.addEventListener('click', () => {
      const nick = this.dom.guestNicknameInput.value.trim() || 'Jogador Convidado';
      this.signInAsGuest(nick, this.selectedGuestEmoji);
      this.closeGuestModal();
      this.onToast(`Bem-vindo, ${nick}!`, 'success');
      audio.playSuccess();
    });

    // Logout
    this.dom.btnLogout?.addEventListener('click', async () => {
      await this.signOut();
      this.closeProfileModal();
      this.onToast('Sessão encerrada.', 'info');
      audio.playTileReturn();
    });
  }

  renderEmojiGrids() {
    // Renderiza grid para o modal de Convidado
    if (this.dom.guestEmojiGrid) {
      this.dom.guestEmojiGrid.innerHTML = '';
      AVATAR_EMOJIS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `emoji-chip ${emoji === this.selectedGuestEmoji ? 'selected' : ''}`;
        btn.textContent = emoji;
        btn.addEventListener('click', () => {
          this.selectedGuestEmoji = emoji;
          if (this.dom.guestAvatarPreview) this.dom.guestAvatarPreview.textContent = emoji;
          this.dom.guestEmojiGrid.querySelectorAll('.emoji-chip').forEach(c => c.classList.remove('selected'));
          btn.classList.add('selected');
          audio.playTileClick();
        });
        this.dom.guestEmojiGrid.appendChild(btn);
      });
    }

    // Renderiza grid para alteração no Perfil
    if (this.dom.profileEmojiGrid) {
      this.dom.profileEmojiGrid.innerHTML = '';
      AVATAR_EMOJIS.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'emoji-chip';
        btn.textContent = emoji;
        btn.addEventListener('click', () => {
          this.updateAvatar(emoji);
          audio.playTileClick();
        });
        this.dom.profileEmojiGrid.appendChild(btn);
      });
    }
  }

  renderAuthMode() {
    if (this.isRegisterMode) {
      this.dom.authModalTitle.textContent = 'Criar Nova Conta';
      this.dom.authSubmitBtn.textContent = 'Cadastrar Conta';
      this.dom.authNameGroup.classList.remove('hidden');
      this.dom.authToggleModeBtn.textContent = 'Já possui uma conta? Entre aqui';
    } else {
      this.dom.authModalTitle.textContent = 'Entrar no AnagramMaster';
      this.dom.authSubmitBtn.textContent = 'Entrar com Email';
      this.dom.authNameGroup.classList.add('hidden');
      this.dom.authToggleModeBtn.textContent = 'Não tem uma conta? Cadastre-se';
    }
    this.clearAuthError();
  }

  async handleGoogleAuth() {
    this.clearAuthError();
    audio.playTileClick();

    if (!navigator.onLine) {
      this.showAuthError('Conexão à internet necessária para login com o Google.');
      return;
    }

    await serverlessDB.init();

    if (!serverlessDB.isCloudEnabled || !serverlessDB.auth) {
      this.showAuthError('Serviço de autenticação em nuvem temporariamente indisponível.');
      return;
    }

    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(serverlessDB.auth, provider);
      const user = result.user;

      this.currentUser = {
        uid: user.uid,
        displayName: user.displayName || user.email.split('@')[0],
        email: user.email,
        photoURL: user.photoURL,
        isGuest: false,
        avatarEmoji: '🌟'
      };

      this.saveSessionUser(this.currentUser);
      this.updateUI();
      this.closeAuthModal();
      this.onToast(`Conectado como ${this.currentUser.displayName}!`, 'success');
      audio.playSuccess();
    } catch (error) {
      console.error('[GoogleAuth] Erro no login:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        this.showAuthError(`Falha no Google Sign-In: ${error.message}`);
      }
    }
  }

  async handleEmailAuth() {
    this.clearAuthError();
    const email = this.dom.authEmailInput.value.trim();
    const pass = this.dom.authPasswordInput.value;
    const name = this.dom.authNameInput ? this.dom.authNameInput.value.trim() : '';

    if (!email || !pass) {
      this.showAuthError('Preencha email e senha.');
      return;
    }

    await serverlessDB.init();

    if (!serverlessDB.isCloudEnabled || !serverlessDB.auth) {
      this.showAuthError('Serviço de nuvem offline.');
      return;
    }

    try {
      const { 
        signInWithEmailAndPassword, 
        createUserWithEmailAndPassword, 
        updateProfile 
      } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');

      if (this.isRegisterMode) {
        const cred = await createUserWithEmailAndPassword(serverlessDB.auth, email, pass);
        const displayName = name || email.split('@')[0];
        await updateProfile(cred.user, { displayName });

        this.currentUser = {
          uid: cred.user.uid,
          displayName,
          email,
          isGuest: false,
          avatarEmoji: '🎓'
        };
        this.onToast('Conta criada com sucesso!', 'success');
      } else {
        const cred = await signInWithEmailAndPassword(serverlessDB.auth, email, pass);
        this.currentUser = {
          uid: cred.user.uid,
          displayName: cred.user.displayName || email.split('@')[0],
          email,
          isGuest: false,
          avatarEmoji: this.currentUser?.avatarEmoji || '🧩'
        };
        this.onToast(`Bem-vindo de volta, ${this.currentUser.displayName}!`, 'success');
      }

      this.saveSessionUser(this.currentUser);
      this.updateUI();
      this.closeAuthModal();
      audio.playSuccess();
    } catch (error) {
      console.error('[EmailAuth] Erro:', error);
      let msg = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        msg = 'Email ou senha incorretos.';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'Este email já está cadastrado. Faça login.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'A senha deve ter no mínimo 6 caracteres.';
      }
      this.showAuthError(msg);
      audio.playError();
    }
  }

  signInAsGuest(nickname, emoji) {
    this.currentUser = {
      uid: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      displayName: nickname,
      email: null,
      isGuest: true,
      avatarEmoji: emoji || '🧩'
    };
    this.saveSessionUser(this.currentUser);
    this.updateUI();
  }

  async signOut() {
    if (serverlessDB.auth && !this.currentUser?.isGuest) {
      try {
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        await signOut(serverlessDB.auth);
      } catch (e) {
        console.warn('[AuthManager] Erro no signOut Firebase:', e);
      }
    }
    this.currentUser = null;
    this.saveSessionUser(null);
    this.updateUI();
  }

  updateAvatar(emoji) {
    if (!this.currentUser) return;
    this.currentUser.avatarEmoji = emoji;
    this.saveSessionUser(this.currentUser);
    this.updateUI();
    if (this.dom.profileAvatarDisplay) {
      this.dom.profileAvatarDisplay.textContent = emoji;
    }
    this.onToast('Avatar atualizado!', 'success');
  }

  updateUI() {
    const hasUser = !!this.currentUser;

    if (this.dom.headerAuthBtn && this.dom.headerUserProfileBtn) {
      if (hasUser) {
        this.dom.headerAuthBtn.classList.add('hidden');
        this.dom.headerUserProfileBtn.classList.remove('hidden');
        if (this.dom.headerUserAvatar) {
          this.dom.headerUserAvatar.textContent = this.currentUser.avatarEmoji || '👤';
        }
        if (this.dom.headerUserName) {
          this.dom.headerUserName.textContent = this.currentUser.displayName || 'Jogador';
        }
      } else {
        this.dom.headerAuthBtn.classList.remove('hidden');
        this.dom.headerUserProfileBtn.classList.add('hidden');
      }
    }
  }

  openAuthModal() {
    this.renderAuthMode();
    this.dom.authModal?.classList.remove('hidden');
  }

  closeAuthModal() {
    this.dom.authModal?.classList.add('hidden');
  }

  openGuestModal() {
    if (this.dom.guestAvatarPreview) {
      this.dom.guestAvatarPreview.textContent = this.selectedGuestEmoji;
    }
    this.dom.guestModal?.classList.remove('hidden');
  }

  closeGuestModal() {
    this.dom.guestModal?.classList.add('hidden');
  }

  openProfileModal() {
    if (!this.currentUser) return;
    if (this.dom.profileDisplayName) {
      this.dom.profileDisplayName.textContent = this.currentUser.displayName;
    }
    if (this.dom.profileEmail) {
      this.dom.profileEmail.textContent = this.currentUser.email || 'Modo Convidado (Offline)';
    }
    if (this.dom.profileAvatarDisplay) {
      this.dom.profileAvatarDisplay.textContent = this.currentUser.avatarEmoji || '🧩';
    }
    this.dom.profileModal?.classList.remove('hidden');
  }

  closeProfileModal() {
    this.dom.profileModal?.classList.add('hidden');
  }

  showAuthError(msg) {
    if (this.dom.authErrorMsg) {
      this.dom.authErrorMsg.textContent = msg;
      this.dom.authErrorMsg.classList.remove('hidden');
    }
  }

  clearAuthError() {
    if (this.dom.authErrorMsg) {
      this.dom.authErrorMsg.textContent = '';
      this.dom.authErrorMsg.classList.add('hidden');
    }
  }
}
