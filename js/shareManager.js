/**
 * SHAREMANAGER.JS - Gerenciador de Compartilhamento Atômico & QR Code
 * Codificação LZ-String em URI Hash, renderização Canvas e interação com Clipboard
 */

import { LZString } from './lzString.js';
import { QRCodeRenderer } from './qrcodeEngine.js';
import { audio } from './audio.js';

export class ShareManager {
  /**
   * Serializa e comprime os dados do desafio em um link com hash URI-safe
   */
  static encodeChallenge(challenge) {
    const payload = JSON.stringify({
      w: challenge.secretWord.toUpperCase().trim(),
      h1: challenge.hint1 ? challenge.hint1.trim() : '',
      h2: challenge.hint2 ? challenge.hint2.trim() : '',
      c: challenge.creator ? challenge.creator.trim() : 'Amigo'
    });
    const compressed = LZString.compressToEncodedURIComponent(payload);
    const url = new URL(window.location.href);
    url.hash = `c=${compressed}`;
    return url.toString();
  }

  /**
   * Lê o hash da URL e tenta descompactar o desafio
   */
  static decodeFromHash() {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#c=')) return null;

    try {
      const compressed = hash.substring(3);
      const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
      if (!decompressed) return null;

      const data = JSON.parse(decompressed);
      if (!data.w) return null;

      return {
        secretWord: data.w,
        hint1: data.h1 || 'Sem dica cadastrada.',
        hint2: data.h2 || 'Sem dica cadastrada.',
        creator: data.c || 'Amigo',
        isShared: true
      };
    } catch (e) {
      console.warn('Erro ao decodificar desafio compartilhado da URL:', e);
      return null;
    }
  }

  /**
   * Abre o modal de compartilhamento com URL e QR Code renderizado
   */
  static showShareModal(challenge) {
    const modal = document.getElementById('shareModal');
    const canvas = document.getElementById('shareQrCanvas');
    const inputUrl = document.getElementById('shareUrlInput');
    const copyBtn = document.getElementById('copyShareUrlBtn');

    if (!modal || !canvas || !inputUrl) return;

    const shareUrl = this.encodeChallenge(challenge);
    inputUrl.value = shareUrl;

    // Renderiza QR Code em Canvas nativo (100% offline)
    QRCodeRenderer.renderToCanvas(canvas, shareUrl, {
      size: 200,
      margin: 2,
      fgColor: '#000000',
      bgColor: '#ffffff'
    });

    if (copyBtn) {
      copyBtn.textContent = 'Copiar Link';
      copyBtn.classList.remove('btn-success');
    }

    modal.classList.remove('hidden');
    audio.playTileClick();
  }

  /**
   * Fecha o modal de compartilhamento
   */
  static closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  /**
   * Copia a URL de compartilhamento para a área de transferência com feedback
   */
  static async copyShareUrl(onToast) {
    const inputUrl = document.getElementById('shareUrlInput');
    const copyBtn = document.getElementById('copyShareUrlBtn');
    if (!inputUrl) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inputUrl.value);
      } else {
        inputUrl.select();
        document.execCommand('copy');
      }

      audio.playSuccess();
      if (copyBtn) {
        copyBtn.textContent = '✓ Copiado!';
      }
      if (onToast) {
        onToast('Link de desafio copiado para a área de transferência!', 'success');
      }
    } catch (err) {
      console.error('Falha ao copiar:', err);
      if (onToast) {
        onToast('Não foi possível copiar o link automaticamente. Selecione e copie manualmente.', 'warning');
      }
    }
  }
}
