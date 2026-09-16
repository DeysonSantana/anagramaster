/**
 * ANAGRAMENGINE.JS - Motor Lógico e Matemático de Anagramas
 * Algoritmo Fisher-Yates com garantia de não-identidade, normalização de caracteres e pontuação
 */

export class AnagramEngine {
  /**
   * Normaliza texto removendo acentos e convertendo para minúsculas
   * Ex: "Pokémon" -> "pokemon"
   */
  static normalize(text) {
    if (!text) return '';
    return text
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  /**
   * Embaralha uma palavra usando Fisher-Yates garantindo que o resultado
   * não seja idêntico à palavra original (a menos que todas as letras sejam iguais)
   */
  static shuffle(word) {
    if (!word || word.length <= 1) return word;

    const chars = word.trim().toUpperCase().split('');
    const originalNormalized = chars.join('');
    
    // Verifica se todas as letras são iguais (ex: "AAA")
    const allSame = chars.every(c => c === chars[0]);
    if (allSame) return originalNormalized;

    let shuffled = '';
    let attempts = 0;
    const maxAttempts = 50;

    do {
      const arr = [...chars];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      shuffled = arr.join('');
      attempts++;
    } while (shuffled === originalNormalized && attempts < maxAttempts);

    // Se ainda for igual após 50 tentativas (ex: palavra muito curta de 2 letras), inverte manualmente
    if (shuffled === originalNormalized && chars.length > 1) {
      const arr = [...chars];
      [arr[0], arr[1]] = [arr[1], arr[0]];
      shuffled = arr.join('');
    }

    return shuffled;
  }

  /**
   * Verifica se o palpite do jogador corresponde à palavra secreta
   */
  static verifyAnswer(guess, secretWord) {
    const normGuess = this.normalize(guess);
    const normSecret = this.normalize(secretWord);
    return normGuess === normSecret && normGuess.length > 0;
  }

  /**
   * Calcula a pontuação final ponderada com decaimento temporal e penalidade por dicas
   * Base: 1000 pontos.
   * Penalidade de tempo: 4 pontos por segundo decorrido.
   * Penalidade por dica: 200 pontos por dica aberta.
   * Piso mínimo de vitória: 100 pontos.
   */
  static calculateScore(secondsElapsed, hintsUsed) {
    const baseScore = 1000;
    const timePenalty = Math.max(0, secondsElapsed * 4);
    const hintPenalty = Math.max(0, hintsUsed * 200);

    const calculated = baseScore - timePenalty - hintPenalty;
    return Math.max(100, Math.round(calculated));
  }

  /**
   * Formata segundos em string MM:SS
   */
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }
}
