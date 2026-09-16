/**
 * DICTIONARY.JS - Banco de Palavras Categorizado e Desafio Diário (100% Offline)
 */

export const CATEGORIES = {
  games: { id: 'games', label: 'Jogos & Geek', icon: '🎮' },
  geography: { id: 'geography', label: 'Geografia & Cidades', icon: '🌍' },
  animals: { id: 'animals', label: 'Reino Animal', icon: '🦁' },
  tech: { id: 'tech', label: 'Ciência & Tecnologia', icon: '🚀' },
  cinema: { id: 'cinema', label: 'Cinema & Séries', icon: '🍿' }
};

export const WORD_BANK = [
  // --- JOGOS & GEEK ---
  {
    word: 'NINTENDO',
    hint1: 'Gigante japonesa dos videogames sediada em Kyoto.',
    hint2: 'Criadora de consoles clássicos como NES, N64 e Switch.',
    category: 'games'
  },
  {
    word: 'PLAYSTATION',
    hint1: 'Marca icônica de consoles criada pela Sony nos anos 90.',
    hint2: 'Famosa pelos botões Triângulo, Círculo, Cruz e Quadrado.',
    category: 'games'
  },
  {
    word: 'MINECRAFT',
    hint1: 'Jogo sandbox de sobrevivência e construção mais vendido da história.',
    hint2: 'Universo formado por blocos tridimensionais pixelados.',
    category: 'games'
  },
  {
    word: 'PIKACHU',
    hint1: 'Roedor elétrico de bochechas vermelhas da franquia Pokémon.',
    hint2: 'O companheiro inseparável do treinador Ash Ketchum.',
    category: 'games'
  },
  {
    word: 'ZELDA',
    hint1: 'Princesa do reino de Hyrule que dá nome a uma famosa saga.',
    hint2: 'Frequentemente protegida pelo herói portador da Master Sword, Link.',
    category: 'games'
  },
  {
    word: 'CYBERPUNK',
    hint1: 'Subgênero de ficção científica caracterizado por alta tecnologia e baixa qualidade de vida.',
    hint2: 'Estética visual com luzes de neon, megacorporações e implantes cibernéticos.',
    category: 'games'
  },

  // --- GEOGRAFIA ---
  {
    word: 'AUSTRALIA',
    hint1: 'País e continente insular cercado pelos oceanos Índico e Pacífico.',
    hint2: 'Terra dos cangurus, coalas e da Grande Barreira de Corais.',
    category: 'geography'
  },
  {
    word: 'PORTUGAL',
    hint1: 'Nação europeia pioneira nas Grandes Navegações marítimas.',
    hint2: 'Famosa pelo fado, pastéis de Belém e sua capital Lisboa.',
    category: 'geography'
  },
  {
    word: 'AMAZONAS',
    hint1: 'Maior estado do Brasil em extensão territorial.',
    hint2: 'Abriga a maior floresta tropical contínua e a bacia hidrográfica do mundo.',
    category: 'geography'
  },
  {
    word: 'ISLANDIA',
    hint1: 'País insular nórdico conhecido como a terra do gelo e do fogo.',
    hint2: 'Repleto de vulcões ativos, gêiseres e fontes termais.',
    category: 'geography'
  },
  {
    word: 'MADAGASCAR',
    hint1: 'Grande nação insular situada na costa sudeste da África.',
    hint2: 'Famosa por sua biodiversidade única, baobás e lêmures.',
    category: 'geography'
  },

  // --- REINO ANIMAL ---
  {
    word: 'CAMALEAO',
    hint1: 'Réptil conhecido por sua extraordinária habilidade de mudar de cor.',
    hint2: 'Possui olhos que se movem de forma independente e língua extremamente veloz.',
    category: 'animals'
  },
  {
    word: 'ORNITORRINCO',
    hint1: 'Mamífero semiaquático monotremado endêmico da Austrália que bota ovos.',
    hint2: 'Possui bico semelhante ao de pato, cauda de castor e esporão venenoso.',
    category: 'animals'
  },
  {
    word: 'GUEPARDO',
    hint1: 'O mamífero terrestre mais veloz do planeta Terra.',
    hint2: 'Pode atingir velocidades superiores a 100 km/h em arrancadas curtas.',
    category: 'animals'
  },
  {
    word: 'PINGUIM',
    hint1: 'Ave marinha não voadora altamente adaptada à vida aquática e ao frio polar.',
    hint2: 'Usa suas asas rígidas como nadadeiras para caçar peixes no oceano.',
    category: 'animals'
  },
  {
    word: 'GOLFINHO',
    hint1: 'Cetáceo extremamente inteligente conhecido por saltos acrobáticos e comunicação por ecolocalização.',
    hint2: 'Mamífero marinho com respiração pulmonar através de um espiráculo.',
    category: 'animals'
  },

  // --- CIÊNCIA & TECNOLOGIA ---
  {
    word: 'ALGORITMO',
    hint1: 'Sequência lógica e finita de passos e instruções para resolver um problema.',
    hint2: 'Base estrutural de todo software e programação computacional.',
    category: 'tech'
  },
  {
    word: 'TELESCOPIO',
    hint1: 'Instrumento óptico que amplia a visão de objetos cósmicos distantes.',
    hint2: 'Hubble e James Webb são exemplos revolucionários deste aparelho.',
    category: 'tech'
  },
  {
    word: 'CRIPTOGRAFIA',
    hint1: 'Técnica de cifrar mensagens para garantir privacidade e integridade de dados.',
    hint2: 'Fundamental para segurança bancária, chaves públicas e assinaturas digitais.',
    category: 'tech'
  },
  {
    word: 'SUPERNOVA',
    hint1: 'Poderosa e brilhante explosão estelar que ocorre no estágio final da vida de certas estrelas.',
    hint2: 'Pode ofuscar galáxias inteiras e dar origem a estrelas de nêutrons ou buracos negros.',
    category: 'tech'
  },
  {
    word: 'FIBRA OPTICA',
    hint1: 'Filamento fino de vidro ou plástico que transmite dados sob a forma de pulsos de luz.',
    hint2: 'Infraestrutura essencial da internet global de alta velocidade.',
    category: 'tech'
  },

  // --- CINEMA & SÉRIES ---
  {
    word: 'INTERESTELAR',
    hint1: 'Obra de ficção científica dirigida por Christopher Nolan sobre viagens através de buracos de minhoca.',
    hint2: 'Explora dilatação temporal gravitacional e o amor como dimensão transcendental.',
    category: 'cinema'
  },
  {
    word: 'MATRIX',
    hint1: 'Filme cult de ficção das irmãs Wachowski sobre a simulação da realidade.',
    hint2: 'Famoso pela pílula vermelha, chuva de código verde e o protagonista Neo.',
    category: 'cinema'
  },
  {
    word: 'GLADIADOR',
    hint1: 'Épico histórico vencedor do Oscar sobre um general romano traído que busca justiça.',
    hint2: 'Estrelado por Russell Crowe no papel do lendário Maximus Decimus Meridius.',
    category: 'cinema'
  },
  {
    word: 'VINGADORES',
    hint1: 'Equipe de super-heróis da Marvel Comics que se reúne para combater ameaças cósmicas.',
    hint2: 'Uniu Homem de Ferro, Capitão América, Thor e Hulk nos cinemas.',
    category: 'cinema'
  }
];

export class DictionaryManager {
  /**
   * Retorna uma palavra aleatória de uma categoria específica
   */
  static getByCategory(categoryId) {
    const list = WORD_BANK.filter(item => item.category === categoryId);
    if (list.length === 0) return WORD_BANK[0];
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  /**
   * Retorna uma palavra aleatória de qualquer categoria
   */
  static getRandomWord() {
    const randomIndex = Math.floor(Math.random() * WORD_BANK.length);
    return WORD_BANK[randomIndex];
  }

  /**
   * Retorna o "Desafio Diário" determinístico para a data atual
   */
  static getDailyChallenge() {
    const today = new Date();
    // Gera uma semente numérica a partir do dia, mês e ano
    const seed = (today.getFullYear() * 1000) + ((today.getMonth() + 1) * 31) + today.getDate();
    const index = seed % WORD_BANK.length;
    return {
      ...WORD_BANK[index],
      isDaily: true
    };
  }
}
