export const EXERCISES = [
  {
    id: 'ufov',
    name: 'Campo Visual',
    subtitle: 'Velocidade de Processamento',
    icon: '⚡',
    color: '#22D3EE',
    science: 'Estudo ACTIVE (Johns Hopkins, 20 anos) — 25% menos risco de demência',
    howToPlay: [
      'Um símbolo pisca no centro da tela por um instante.',
      'Ao mesmo tempo, um ponto acende em uma das 8 posições ao redor.',
      'Clique o símbolo correto (botões acima) E a posição do ponto (círculos).',
      'Ambos precisam estar certos para pontuar.',
      'Nos níveis avançados, pontos falsos aparecem para confundir — identifique o alvo real (mais brilhante).',
    ],
    difficulties: [
      { level: 1, label: 'Iniciante',     duration: 65, startMs: 600, minMs: 400, distractors: 0, minScore: 55 },
      { level: 2, label: 'Intermediário', duration: 65, startMs: 380, minMs: 250, distractors: 0, minScore: 65 },
      { level: 3, label: 'Avançado',      duration: 65, startMs: 220, minMs: 160, distractors: 0, minScore: 75 },
      { level: 4, label: 'Expert',        duration: 70, startMs: 200, minMs: 140, distractors: 2, minScore: 70 },
      { level: 5, label: 'Mestre',        duration: 70, startMs: 180, minMs: 120, distractors: 4, minScore: null },
    ],
  },
  {
    id: 'nback',
    name: 'N-Back',
    subtitle: 'Memória de Trabalho',
    icon: '🧠',
    color: '#A78BFA',
    science: 'Li et al. 2021 — maior transferência para funções não-treinadas vs outros métodos',
    howToPlay: [
      'Uma célula acende no grid a cada intervalo.',
      'No nível 1 (Single): monitore só a posição.',
      'Nos níveis 2-4 (Dual): uma letra também aparece — monitore as duas streams.',
      'Aperte MATCH quando a posição atual = N posições atrás.',
      'No Dual, aperte MATCH-L quando a letra atual = N letras atrás.',
      'N e número de streams aumentam com a dificuldade.',
    ],
    difficulties: [
      { level: 1, label: 'Single N-Back 2', duration: 90,  n: 2, single: true,  intervalMs: 2500, minScore: 60 },
      { level: 2, label: 'Dual N-Back 2',   duration: 90,  n: 2, single: false, intervalMs: 2000, minScore: 65 },
      { level: 3, label: 'Dual N-Back 3',   duration: 90,  n: 3, single: false, intervalMs: 2000, minScore: 70 },
      { level: 4, label: 'Dual N-Back 4',   duration: 90,  n: 4, single: false, intervalMs: 2000, minScore: 75 },
      { level: 5, label: 'Triple N-Back 2', duration: 100, n: 2, single: false, triple: true, intervalMs: 2200, minScore: null },
    ],
  },
  {
    id: 'sequence',
    name: 'Simon',
    subtitle: 'Memória Sequencial',
    icon: '🎯',
    color: '#34D399',
    science: 'Treino de memória visuoespacial sequencial — span de memória de curto prazo',
    howToPlay: [
      'O computador ilumina uma sequência de cores.',
      'Observe com atenção — a sequência some.',
      'Repita clicando nas cores na mesma ordem.',
      'A cada acerto, a sequência cresce em 1.',
      'No nível 4, sem repetição ao errar — sequência reinicia do zero.',
    ],
    difficulties: [
      { level: 1, label: '4 Cores Lento',  duration: 120, numColors: 4, intervalMs: 680, noRetry: false, minScore: 55 },
      { level: 2, label: '4 Cores Rápido', duration: 120, numColors: 4, intervalMs: 480, noRetry: false, minScore: 65 },
      { level: 3, label: '6 Cores',        duration: 120, numColors: 6, intervalMs: 400, noRetry: false, minScore: 72 },
      { level: 4, label: '6 Cores Sem Retry', duration: 120, numColors: 6, intervalMs: 360, noRetry: true, minScore: null },
    ],
  },
  {
    id: 'stroop',
    name: 'Stroop',
    subtitle: 'Controle Inibitório',
    icon: '🎨',
    color: '#FB923C',
    science: 'Stroop, 1935 — padrão-ouro para medir inibição de resposta dominante',
    howToPlay: [
      'Uma palavra de cor aparece escrita numa tinta colorida diferente.',
      'Clique na cor da TINTA — ignore o significado.',
      'Mais cores e menos tempo são adicionados com a dificuldade.',
      'No nível 4, as palavras aparecem em inglês mas as opções são em português.',
    ],
    difficulties: [
      { level: 1, label: '4 Cores',         duration: 60, numColors: 4, lang: 'pt', minScore: 55 },
      { level: 2, label: '5 Cores',         duration: 55, numColors: 5, lang: 'pt', minScore: 65 },
      { level: 3, label: '6 Cores',         duration: 50, numColors: 6, lang: 'pt', minScore: 72 },
      { level: 4, label: 'Inglês/Português', duration: 50, numColors: 6, lang: 'en', minScore: null },
    ],
  },
  {
    id: 'switching',
    name: 'Alternância',
    subtitle: 'Flexibilidade Cognitiva',
    icon: '🔀',
    color: '#F472B6',
    science: 'WCST-inspired (NYU/CUNY) — completa o trio executivo: inibição + memória + flexibilidade',
    howToPlay: [
      'Uma figura colorida aparece no centro.',
      'A REGRA ativa é mostrada no topo.',
      'Regra COR → clique na cor da figura.',
      'Regra FORMA → clique no formato da figura.',
      'No nível 4, uma terceira regra LADOS é adicionada.',
      'No nível 5, a regra muda sem aviso — descubra pela reação do jogo.',
    ],
    difficulties: [
      { level: 1, label: 'Troca Lenta',   duration: 65,  switchEvery: 6, numColors: 3, numShapes: 3, threeRules: false, silent: false, minScore: 55 },
      { level: 2, label: 'Troca Média',   duration: 60,  switchEvery: 4, numColors: 3, numShapes: 3, threeRules: false, silent: false, minScore: 65 },
      { level: 3, label: 'Troca Rápida',  duration: 55,  switchEvery: 2, numColors: 4, numShapes: 4, threeRules: false, silent: false, minScore: 72 },
      { level: 4, label: '3 Regras',      duration: 65,  switchEvery: 4, numColors: 3, numShapes: 3, threeRules: true,  silent: false, minScore: 68 },
      { level: 5, label: 'Sem Aviso',     duration: 60,  switchEvery: 3, numColors: 4, numShapes: 4, threeRules: true,  silent: true,  minScore: null },
    ],
  },
]

export const BREATHING = {
  id: 'breathing',
  name: 'Box Breathing',
  subtitle: 'Descanso Mental',
  icon: '🌊',
  color: '#60A5FA',
  duration: 120,
}

export const AVATAR_COLORS = [
  '#22D3EE', '#A78BFA', '#34D399', '#FB923C', '#F472B6', '#60A5FA',
  '#FCD34D', '#86EFAC', '#FCA5A5', '#C4B5FD',
]

export const SESSION_DURATION_MIN = Math.round(
  EXERCISES.reduce((a, e) => a + e.difficulties[0].duration, 0) / 60
)

export function getDifficulty(exercise, level) {
  return exercise.difficulties[(level || 1) - 1] || exercise.difficulties[0]
}

export const UNLOCK_THRESHOLD = { 1: 55, 2: 65, 3: 72, 4: 68 }
