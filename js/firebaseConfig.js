/**
 * FIREBASECONFIG.JS - Camada de Dados Serverless e Autenticação
 * Compatível 100% com GitHub Pages e PWA Offline-First
 * Inicializa o SDK Modular do Firebase (Auth + Firestore) com fallback para LocalStorage
 */

const STORAGE_FIREBASE_CONFIG = 'ANAGRAM_FIREBASE_CONFIG';

// Configuração padrão do Firebase para deploy no GitHub Pages
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCqGd42xeen1HGc4PpgBa8sH1nhOi17ylM",
  authDomain: "quizmaster-f9388.firebaseapp.com",
  projectId: "quizmaster-f9388",
  storageBucket: "quizmaster-f9388.firebasestorage.app",
  messagingSenderId: "169092133424",
  appId: "1:169092133424:web:019d8ef6e122468864f3f5",
  measurementId: "G-XEPBYW3SVY"
};

class ServerlessDB {
  constructor() {
    this.firebaseApp = null;
    this.auth = null;
    this.firestore = null;
    this.isCloudEnabled = false;
    this.isInitializing = false;
    this.initPromise = null;
    this.customConfig = this.loadConfig() || DEFAULT_FIREBASE_CONFIG;
  }

  loadConfig() {
    try {
      const data = localStorage.getItem(STORAGE_FIREBASE_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('[Firebase] Falha ao carregar configuração personalizada:', e);
      return null;
    }
  }

  saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_FIREBASE_CONFIG, JSON.stringify(config));
      this.customConfig = config;
      return true;
    } catch (e) {
      console.error('[Firebase] Erro ao salvar configuração:', e);
      return false;
    }
  }

  resetConfig() {
    localStorage.removeItem(STORAGE_FIREBASE_CONFIG);
    this.customConfig = DEFAULT_FIREBASE_CONFIG;
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      // Se estiver offline ou sem navigator.onLine, opera em fallback gracioso
      if (!navigator.onLine) {
        console.log('[Firebase] Dispositivo offline. Modo nuvem temporariamente suspenso.');
        this.isCloudEnabled = false;
        return false;
      }

      try {
        const config = this.customConfig || DEFAULT_FIREBASE_CONFIG;
        if (!config || !config.apiKey || config.apiKey.includes('...')) {
          console.log('[Firebase] Configuração ausente ou incompleta. Operando em modo offline.');
          this.isCloudEnabled = false;
          return false;
        }

        // Importação dinâmica do Firebase Modular SDK via CDN oficial
        const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
        const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

        const apps = getApps();
        this.firebaseApp = apps.length > 0 ? apps[0] : initializeApp(config);
        this.auth = getAuth(this.firebaseApp);
        this.firestore = getFirestore(this.firebaseApp);
        this.isCloudEnabled = true;

        console.log('[Firebase] Nuvem conectada com sucesso (Auth + Firestore).');
        return true;
      } catch (error) {
        console.warn('[Firebase] Conexão com Firebase falhou. Usando fallback offline:', error.message);
        this.isCloudEnabled = false;
        return false;
      }
    })();

    return this.initPromise;
  }
}

export const serverlessDB = new ServerlessDB();
