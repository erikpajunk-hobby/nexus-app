export const EXERCISES = [
  {
    id: 'ufov',
    name: 'Campo Visual',
    subtitle: 'Velocidade de Processamento',
    instruction: 'Um símbolo pisca no centro E um ponto aparece na periferia ao mesmo tempo. Clique o símbolo correto E a posição do ponto. O campo expande conforme você melhora.',
    duration: 65,
    color: '#22D3EE',
    icon: '⚡',
  },
  {
    id: 'nback',
    name: 'Dual N-Back',
    subtitle: 'Memória de Trabalho',
    instruction: 'A cada 2s: posição acende + letra aparece. MATCH-P quando posição = 2 passos atrás. MATCH-L quando letra = 2 passos atrás. Pressione um, ambos ou nenhum.',
    duration: 90,
    color: '#A78BFA',
    icon: '🧠',
  },
  {
    id: 'sequence',
    name: 'Simon',
    subtitle: 'Memória Sequencial',
    instruction: 'Observe a sequência de cores e repita na mesma ordem. A sequência cresce a cada nível.',
    duration: 120,
    color: '#34D399',
    icon: '🎯',
  },
  {
    id: 'stroop',
    name: 'Stroop',
    subtitle: 'Controle Inibitório',
    instruction: 'Clique na COR DA TINTA em que a palavra está escrita — ignore completamente o significado.',
    duration: 60,
    color: '#FB923C',
    icon: '🎨',
  },
  {
    id: 'breathing',
    name: 'Box Breathing',
    subtitle: 'Atenção Focada',
    instruction: 'Siga o ritmo do círculo: INSPIRE 4s → SEGURE 4s → EXPIRE 4s.',
    duration: 120,
    color: '#60A5FA',
    icon: '🌊',
  },
]

export const AVATAR_COLORS = [
  '#22D3EE', '#A78BFA', '#34D399', '#FB923C', '#F472B6', '#60A5FA',
  '#FCD34D', '#86EFAC', '#FCA5A5', '#C4B5FD',
]

export const SESSION_DURATION_MIN = Math.round(
  EXERCISES.reduce((a, e) => a + e.duration, 0) / 60
)
