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
      'O campo expande e o flash acelera conforme você acerta.',
    ],
    difficulties: [
      { level: 1, label: 'Iniciante',     duration: 65, startMs: 600, minMs: 400, minScore: 60 },
      { level: 2, label: 'Intermediário', duration: 65, startMs: 380, minMs: 250, minScore: 70 },
      { level: 3, label: 'Avançado',      duration: 65, startMs: 220, minMs: 160, minScore: null },
    ],
  },
  {
    id: 'nback',
    name: 'Dual N-Back',
    subtitle: 'Memória de Trabalho',
    icon: '🧠',
    color: '#A78BFA',
    science: 'Li et al. 2021 — maior transferência para funções não-treinadas vs outros métodos',
    howToPlay: [
      'A cada 2s: uma célula acende no grid E uma letra aparece.',
      'Você monitora as duas streams ao mesmo tempo.',
      'Aperte MATCH-P quando a posição atual = a de N passos atrás.',
      'Aperte MATCH-L quando a letra atual = a de N passos atrás.',
      'Pode apertar os dois, um, ou nenhum por rodada.',
      'N aumenta com a dificuldade (2 → 3 → 4).',
    ],
    difficulties: [
      { level: 1, label: 'N-Back 2', duration: 90, n: 2, minScore: 60 },
      { level: 2, label: 'N-Back 3', duration: 90, n: 3, minScore: 70 },
      { level: 3, label: 'N-Back 4', duration: 90, n: 4, minScore: null },
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
      'Você tem 3 vidas por rodada.',
    ],
    difficulties: [
      { level: 1, label: '4 Cores Lento',  duration: 120, numColors: 4, intervalMs: 680, minScore: 60 },
      { level: 2, label: '4 Cores Rápido', duration: 120, numColors: 4, intervalMs: 480, minScore: 70 },
      { level: 3, label: '6 Cores',        duration: 120, numColors: 6, intervalMs: 360, minScore: null },
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
      'Ignore o que a palavra diz.',
      'Clique na cor da TINTA — não no significado.',
      'Exemplo: "AZUL" em tinta vermelha → clique VERMELHO.',
      'Mais cores são adicionadas com a dificuldade.',
    ],
    difficulties: [
      { level: 1, label: '4 Cores', duration: 60, numColors: 4, minScore: 60 },
      { level: 2, label: '5 Cores', duration: 55, numColors: 5, minScore: 70 },
      { level: 3, label: '6 Cores', duration: 50, numColors: 6, minScore: null },
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
      'A REGRA ativa é mostrada no topo: COR ou FORMA.',
      'Clique na opção que corresponde à regra ativa.',
      'Regra COR → clique na cor da figura.',
      'Regra FORMA → clique no formato da figura.',
      'A regra muda após N acertos consecutivos — adapte rápido.',
    ],
    difficulties: [
      { level: 1, label: 'Troca Lenta',  duration: 65, switchEvery: 6, numColors: 3, numShapes: 3, minScore: 60 },
      { level: 2, label: 'Troca Média',  duration: 60, switchEvery: 4, numColors: 3, numShapes: 3, minScore: 70 },
      { level: 3, label: 'Troca Rápida', duration: 55, switchEvery: 2, numColors: 4, numShapes: 4, minScore: null },
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

export const UNLOCK_THRESHOLD = { 1: 60, 2: 70 }
