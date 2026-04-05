import { EXERCISES, SESSION_DURATION_MIN } from '../constants.js'
import { PageWrap } from '../components/UI.jsx'

export default function Home({ profile, sessions, onStartFull, onStartSingle, onPerformance, onHistory, onCompare, onSwitchProfile }) {
  const today = new Date().toDateString()
  const isWeekend = [0, 6].includes(new Date().getDay())
  const alreadyDone = sessions?.some(s => s.is_full_session && new Date(s.created_at).toDateString() === today)

  // Quick streak for header
  const fullSessions = sessions?.filter(s => s.is_full_session) ?? []
  const streak = (() => {
    if (fullSessions.length === 0) return 0
    const dates = [...new Set(fullSessions.map(s => new Date(s.created_at).toDateString()))].map(d => new Date(d)).sort((a, b) => b - a)
    const todayD = new Date(); todayD.setHours(0,0,0,0)
    const yest = new Date(todayD); yest.setDate(todayD.getDate()-1)
    if (dates[0] < yest) return 0
    let s = 1; let prev = dates[0]; prev.setHours(0,0,0,0)
    for (let i = 1; i < dates.length; i++) {
      const d = dates[i]; d.setHours(0,0,0,0)
      if ((prev - d) / 86400000 === 1) { s++; prev = d } else break
    }
    return s
  })()

  return (
    <PageWrap>
      <div className="fade" style={{ width: '100%', maxWidth: 360 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 3 }}>NEXUS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${profile.avatar_color}18`, border: `2px solid ${profile.avatar_color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: profile.avatar_color }}>
                {profile.name[0].toUpperCase()}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#E8F0FF' }}>{profile.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#FCD34D', lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 1 }}>STREAK 🔥</div>
            </div>
            <button onClick={onSwitchProfile} style={{ background: '#0C1520', border: '1px solid #1A2A3A', borderRadius: 8, padding: '6px 10px', color: '#5B7A9A', fontSize: 10, fontFamily: 'JetBrains Mono', letterSpacing: 1 }}>↩ TROCAR</button>
          </div>
        </div>

        {/* Status */}
        {alreadyDone && (
          <div style={{ background: '#0B1E14', border: '1px solid #34D39930', borderRadius: 16, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26 }}>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>Sessão de hoje completa!</div>
              <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 2 }}>Volte amanhã para manter o streak</div>
            </div>
          </div>
        )}
        {!alreadyDone && isWeekend && (
          <div style={{ background: '#0A1420', border: '1px solid #60A5FA18', borderRadius: 16, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26 }}>🌴</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#60A5FA' }}>Dia de descanso</div>
              <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 2 }}>Mas pode praticar se quiser!</div>
            </div>
          </div>
        )}

        {/* Full session CTA */}
        <button onClick={onStartFull} style={{
          width: '100%', padding: '18px 20px', borderRadius: 16, marginBottom: 14,
          background: alreadyDone ? '#0C1520' : 'linear-gradient(135deg, #22D3EE, #3B82F6)',
          border: alreadyDone ? '1px solid #1A2A3A' : 'none',
          color: alreadyDone ? '#5B7A9A' : '#070B14',
          fontSize: 15, fontWeight: 800, letterSpacing: 2,
          boxShadow: alreadyDone ? 'none' : '0 6px 28px #22D3EE22',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{alreadyDone ? 'PRATICAR DE NOVO' : 'INICIAR SESSÃO'}</span>
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', opacity: 0.7 }}>~{SESSION_DURATION_MIN} min →</span>
        </button>

        {/* Quick play */}
        <div style={{ background: '#0A1520', borderRadius: 18, padding: '14px 16px', marginBottom: 12, border: '1px solid #1A2A3A' }}>
          <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 12 }}>EXERCÍCIO ESPECÍFICO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {EXERCISES.map((ex, i) => (
              <button key={ex.id} onClick={() => onStartSingle(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 12, background: '#0C1520', border: `1px solid ${ex.color}18`, textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = ex.color + '55'}
                onMouseLeave={e => e.currentTarget.style.borderColor = ex.color + '18'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${ex.color}12`, border: `1px solid ${ex.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{ex.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#C0D0E0' }}>{ex.name}</div>
                  <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 1 }}>{ex.subtitle} • {ex.duration}s</div>
                </div>
                <span style={{ fontSize: 12, color: ex.color, opacity: 0.5 }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: '📊 Desempenho', onClick: onPerformance },
            { label: '⚔️ Comparar', onClick: onCompare },
            { label: '📋 Histórico', onClick: onHistory },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{ padding: '12px 8px', borderRadius: 12, background: '#0C1520', border: '1px solid #1A2A3A', color: '#7090A8', fontSize: 11, fontWeight: 700, letterSpacing: 0.5, transition: 'all 0.2s', textAlign: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A4060'; e.currentTarget.style.color = '#C0D0E0' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2A3A'; e.currentTarget.style.color = '#7090A8' }}
            >{btn.label}</button>
          ))}
        </div>

      </div>
    </PageWrap>
  )
}
