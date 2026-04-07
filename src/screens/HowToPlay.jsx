import { useState } from 'react'
import { EXERCISES, BREATHING } from '../constants.js'
import { PageWrap, BackBtn } from '../components/UI.jsx'

function LevelBadge({ level, label, unlocked, current }) {
  const colors = ['#22D3EE', '#F59E0B', '#EF4444']
  const c = colors[level - 1]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
      borderRadius: 10, background: unlocked ? `${c}10` : '#0C1520',
      border: `1px solid ${unlocked ? c + '40' : '#1A2A3A'}`,
      opacity: unlocked ? 1 : 0.4,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: unlocked ? `${c}25` : '#162030', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: unlocked ? c : '#3A5470', flexShrink: 0 }}>
        {unlocked ? level : '🔒'}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: unlocked ? '#C0D0E0' : '#3A5470' }}>{label}</div>
        {current && <div style={{ fontSize: 8, color: c, fontFamily: 'JetBrains Mono', letterSpacing: 1 }}>← NÍVEL ATUAL</div>}
      </div>
    </div>
  )
}

function ExerciseCard({ ex, levels }) {
  const [open, setOpen] = useState(false)
  const journeyLevel = levels?.[ex.id]?.journey ?? 1
  const unlockedLevel = levels?.[ex.id]?.unlocked ?? 1
  const lvlColors = ['#22D3EE', '#F59E0B', '#EF4444']
  const curColor = lvlColors[journeyLevel - 1]

  return (
    <div style={{ background: '#0A1520', borderRadius: 16, border: `1px solid ${open ? ex.color + '30' : '#1A2A3A'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'none', border: 'none', textAlign: 'left' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${ex.color}15`, border: `2px solid ${ex.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{ex.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FF' }}>{ex.name}</div>
          <div style={{ fontSize: 9, color: ex.color, fontFamily: 'JetBrains Mono', letterSpacing: 1, marginTop: 2 }}>{ex.subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 9, color: curColor, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>L{journeyLevel}</div>
          <span style={{ color: '#3A5470', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="fade" style={{ padding: '0 16px 16px' }}>
          {/* Science */}
          <div style={{ padding: '8px 12px', background: '#060D18', borderRadius: 10, border: `1px solid ${ex.color}15`, marginBottom: 12 }}>
            <div style={{ fontSize: 8, color: ex.color, fontFamily: 'JetBrains Mono', letterSpacing: 1.5, marginBottom: 4 }}>EVIDÊNCIA CIENTÍFICA</div>
            <div style={{ fontSize: 11, color: '#7090A8', lineHeight: 1.5 }}>{ex.science}</div>
          </div>

          {/* How to play */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 8 }}>COMO JOGAR</div>
            {ex.howToPlay.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${ex.color}15`, border: `1px solid ${ex.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: ex.color, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <div style={{ fontSize: 12, color: '#A0B0C0', lineHeight: 1.55 }}>{step}</div>
              </div>
            ))}
          </div>

          {/* Levels */}
          <div>
            <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 8 }}>NÍVEIS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ex.difficulties.map(d => (
                <LevelBadge
                  key={d.level}
                  level={d.level}
                  label={d.label}
                  unlocked={d.level <= unlockedLevel}
                  current={d.level === journeyLevel}
                />
              ))}
            </div>
            <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 8 }}>
              Score ≥ {ex.difficulties[journeyLevel - 1]?.minScore ?? '—'} para desbloquear o próximo nível
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HowToPlay({ levels, onBack }) {
  return (
    <PageWrap>
      <div className="fade" style={{ width: '100%', maxWidth: 360 }}>
        <BackBtn onClick={onBack} />
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#E8F0FF' }}>Como Jogar</div>
          <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 1.5, marginTop: 4 }}>
            TOQUE EM CADA JOGO PARA EXPANDIR
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {EXERCISES.map(ex => (
            <ExerciseCard key={ex.id} ex={ex} levels={levels} />
          ))}
        </div>

        {/* Breathing separate */}
        <div style={{ background: '#0A1520', borderRadius: 16, border: '1px solid #1A2A3A', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${BREATHING.color}15`, border: `2px solid ${BREATHING.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{BREATHING.icon}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FF' }}>{BREATHING.name}</div>
              <div style={{ fontSize: 9, color: BREATHING.color, fontFamily: 'JetBrains Mono', letterSpacing: 1, marginTop: 2 }}>{BREATHING.subtitle} — opcional</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#7090A8', lineHeight: 1.55 }}>
            Não faz parte da sessão principal. Use como encerramento ou quando quiser desacelerar. Inspire 4s → segure 4s → expire 4s. Reduz cortisol e melhora a consolidação de memória.
          </p>
        </div>
      </div>
    </PageWrap>
  )
}
