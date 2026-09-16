/**
 * LEADERBOARDMANAGER.JS - Ranking e Pódio em Tempo Real para Salas Multiplayer
 * Escuta em tempo real (onSnapshot) a subcoleção de scores no Firestore
 */

import { serverlessDB } from './firebaseConfig.js';
import { audio } from './audio.js';

export class LeaderboardManager {
  constructor(app) {
    this.app = app;
    this.currentPin = null;
    this.unsubscribeScores = null;

    this.dom = {
      podiumScreen: document.getElementById('roomPodiumScreen'),
      podiumPinBadge: document.getElementById('podiumPinBadge'),
      podiumTitle: document.getElementById('podiumTitle'),
      firstPlaceCard: document.getElementById('firstPlaceCard'),
      secondPlaceCard: document.getElementById('secondPlaceCard'),
      thirdPlaceCard: document.getElementById('thirdPlaceCard'),
      fullScoresList: document.getElementById('podiumScoresList'),
      btnExitPodium: document.getElementById('btnExitPodium')
    };

    this.bindEvents();
  }

  bindEvents() {
    this.dom.btnExitPodium?.addEventListener('click', () => {
      this.stopListening();
      audio.playTileClick();
      this.app.switchScreen('hub');
    });
  }

  /**
   * Inicia a escuta em tempo real da subcoleção anagram_rooms/{pin}/scores
   */
  async startListening(pin, isHost = false) {
    this.currentPin = pin;
    this.stopListening();

    if (this.dom.podiumPinBadge) {
      this.dom.podiumPinBadge.textContent = `PIN: ${pin}`;
    }

    // Se estiver conectado ao Firebase Firestore
    if (serverlessDB.isCloudEnabled && serverlessDB.firestore) {
      try {
        const { collection, query, orderBy, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const scoresRef = collection(serverlessDB.firestore, 'anagram_rooms', pin, 'scores');
        const q = query(scoresRef, orderBy('score', 'desc'));

        this.unsubscribeScores = onSnapshot(q, (snapshot) => {
          const scores = [];
          snapshot.forEach(doc => {
            scores.push({ id: doc.id, ...doc.data() });
          });
          this.renderLeaderboard(scores);
        }, (err) => {
          console.warn('[Leaderboard] Erro no onSnapshot de scores:', err);
          this.fallbackLocalLeaderboard(pin);
        });
      } catch (e) {
        console.warn('[Leaderboard] Falha ao configurar Firestore realtime:', e);
        this.fallbackLocalLeaderboard(pin);
      }
    } else {
      this.fallbackLocalLeaderboard(pin);
    }
  }

  stopListening() {
    if (this.unsubscribeScores) {
      this.unsubscribeScores();
      this.unsubscribeScores = null;
    }
  }

  fallbackLocalLeaderboard(pin) {
    const key = `ANAGRAM_ROOM_${pin}_SCORES`;
    const local = JSON.parse(localStorage.getItem(key) || '[]');
    this.renderLeaderboard(local);
  }

  /**
   * Renderiza os 3 primeiros colocados no Pódio visual e os demais na tabela
   */
  renderLeaderboard(scoresList) {
    // Ordena do maior score para o menor
    const sorted = [...scoresList].sort((a, b) => (b.score || 0) - (a.score || 0));

    // 1º Colocado
    if (this.dom.firstPlaceCard) {
      const p1 = sorted[0];
      if (p1) {
        this.dom.firstPlaceCard.innerHTML = `
          <div class="podium-step first">
            <span class="podium-crown">👑</span>
            <div class="podium-avatar">${p1.avatar || '🥇'}</div>
            <div class="podium-name">${this.escapeHtml(p1.nickname || 'Jogador')}</div>
            <div class="podium-score">${p1.score || 0} pts</div>
          </div>
        `;
      } else {
        this.dom.firstPlaceCard.innerHTML = `
          <div class="podium-step first empty">
            <span class="podium-crown">👑</span>
            <div class="podium-avatar">?</div>
            <div class="podium-name">Aguardando...</div>
          </div>
        `;
      }
    }

    // 2º Colocado
    if (this.dom.secondPlaceCard) {
      const p2 = sorted[1];
      if (p2) {
        this.dom.secondPlaceCard.innerHTML = `
          <div class="podium-step second">
            <span class="podium-medal">🥈</span>
            <div class="podium-avatar">${p2.avatar || '🥈'}</div>
            <div class="podium-name">${this.escapeHtml(p2.nickname || 'Jogador')}</div>
            <div class="podium-score">${p2.score || 0} pts</div>
          </div>
        `;
      } else {
        this.dom.secondPlaceCard.innerHTML = `
          <div class="podium-step second empty">
            <span class="podium-medal">🥈</span>
            <div class="podium-avatar">?</div>
            <div class="podium-name">Aguardando...</div>
          </div>
        `;
      }
    }

    // 3º Colocado
    if (this.dom.thirdPlaceCard) {
      const p3 = sorted[2];
      if (p3) {
        this.dom.thirdPlaceCard.innerHTML = `
          <div class="podium-step third">
            <span class="podium-medal">🥉</span>
            <div class="podium-avatar">${p3.avatar || '🥉'}</div>
            <div class="podium-name">${this.escapeHtml(p3.nickname || 'Jogador')}</div>
            <div class="podium-score">${p3.score || 0} pts</div>
          </div>
        `;
      } else {
        this.dom.thirdPlaceCard.innerHTML = `
          <div class="podium-step third empty">
            <span class="podium-medal">🥉</span>
            <div class="podium-avatar">?</div>
            <div class="podium-name">Aguardando...</div>
          </div>
        `;
      }
    }

    // Lista completa de posições (4º em diante)
    if (this.dom.fullScoresList) {
      this.dom.fullScoresList.innerHTML = '';
      if (sorted.length <= 3) {
        if (sorted.length === 0) {
          this.dom.fullScoresList.innerHTML = '<li class="ranking-item text-muted">Aguardando participantes concluírem o desafio...</li>';
        }
      } else {
        sorted.slice(3).forEach((item, index) => {
          const li = document.createElement('li');
          li.className = 'ranking-item';
          li.innerHTML = `
            <span class="ranking-pos">#${index + 4}</span>
            <span class="ranking-avatar-small">${item.avatar || '👤'}</span>
            <span class="ranking-name">${this.escapeHtml(item.nickname || 'Jogador')}</span>
            <span class="ranking-score">${item.score || 0} pts</span>
          `;
          this.dom.fullScoresList.appendChild(li);
        });
      }
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
