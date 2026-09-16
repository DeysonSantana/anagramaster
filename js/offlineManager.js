/**
 * OFFLINEMANAGER.JS - Gerenciador PWA e Resiliência de Conexão
 * Registro de Service Worker, status de conectividade em tempo real e instalação nativa
 */

export class OfflineManager {
  constructor(onToast) {
    this.onToast = onToast || (() => {});
    this.deferredInstallPrompt = null;
    this.installBtn = document.getElementById('btnInstallPwa');
    this.statusBadge = document.getElementById('connectionStatusBadge');
    this.statusText = document.getElementById('connectionStatusText');
  }

  init() {
    this.registerServiceWorker();
    this.setupNetworkListeners();
    this.setupInstallPrompt();
    this.updateNetworkStatus(navigator.onLine);
  }

  /**
   * Registra o Service Worker
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registrado com escopo:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Falha no registro do Service Worker:', error);
          });
      });
    }
  }

  /**
   * Monitoramento de estado online/offline
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.updateNetworkStatus(true);
      this.onToast('Conexão restabelecida! (Online)', 'success');
    });

    window.addEventListener('offline', () => {
      this.updateNetworkStatus(false);
      this.onToast('Modo Offline ativado. O jogo continua funcionando normalmente!', 'warning');
    });
  }

  updateNetworkStatus(isOnline) {
    if (this.statusBadge && this.statusText) {
      if (isOnline) {
        this.statusBadge.classList.remove('offline');
        this.statusBadge.classList.add('online');
        this.statusText.textContent = 'Online';
        this.statusBadge.title = 'Conectado à internet';
      } else {
        this.statusBadge.classList.remove('online');
        this.statusBadge.classList.add('offline');
        this.statusText.textContent = 'Offline';
        this.statusBadge.title = 'Modo 100% Offline (Cache PWA ativo)';
      }
    }

    // Sincroniza badge do drawer mobile
    const drawerBadge = document.getElementById('drawerConnectionBadge');
    if (drawerBadge) {
      if (isOnline) {
        drawerBadge.className = 'drawer-badge online';
        drawerBadge.textContent = '● Online';
      } else {
        drawerBadge.className = 'drawer-badge offline';
        drawerBadge.textContent = '● Offline';
      }
    }
  }

  /**
   * Captura do evento de instalação do PWA
   */
  setupInstallPrompt() {
    const drawerInstallBtn = document.getElementById('drawerBtnInstallPwa');
    const drawerInstallRow = document.getElementById('drawerInstallRow');

    const handleInstallClick = async () => {
      if (!this.deferredInstallPrompt) return;
      this.deferredInstallPrompt.prompt();
      const { outcome } = await this.deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        this.onToast('Aplicativo instalado com sucesso!', 'success');
      }
      this.deferredInstallPrompt = null;
      if (this.installBtn) this.installBtn.style.display = 'none';
      if (drawerInstallRow) drawerInstallRow.style.display = 'none';
    };

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;

      if (this.installBtn) {
        this.installBtn.style.display = 'inline-flex';
        this.installBtn.addEventListener('click', handleInstallClick);
      }
      if (drawerInstallBtn && drawerInstallRow) {
        drawerInstallRow.style.display = 'flex';
        drawerInstallBtn.addEventListener('click', handleInstallClick);
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredInstallPrompt = null;
      if (this.installBtn) this.installBtn.style.display = 'none';
      if (drawerInstallRow) drawerInstallRow.style.display = 'none';
      console.log('[PWA] Aplicativo AnagramMaster instalado.');
    });
  }
}
