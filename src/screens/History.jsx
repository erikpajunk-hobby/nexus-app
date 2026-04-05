import { EXERCISES } from '../constants.js'
import { PageWrap, BackBtn } from '../components/UI.jsx'

export default function History({ profile, sessions, onBack }) {
  const all = sessions ?? []

  const fmt = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' })
  }

  return (
    <PageWrap>
      <div className="fade" style={{ width: '100%', maxWidth: 360 }}>
        <BackBtn onClick={onBack} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${profile.avatar_color}18`, border: `2px solid ${profile.avatar_color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: profile.avatar_color, flexShrink: 0 }}>
            {profile.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#E8F0FF' }}>Histórico</div>
            <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono' }}>{profile.name} • {all.length} registros</div>
          </div>
        </div>

        {all.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#3A5470', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📭</div>
            Nenhuma sessão ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {all.map((session) => {
              const avg = session.avg_score
              const grade = avg >= 80 ? '#34D399' : avg >= 60 ? '#22D3EE' : avg >= 40 ? '#F59E0B' : '#EF4444'
              const exScores = session.session_exercises ?? []
              return (
                <div key={session.id} style={{ background: '#0A1520', borderRadius: 16, padding: '14px 16px', border: '1px solid #1A2A3A' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#C0D0E0' }}>{fmt(session.created_at)}</div>
                      <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 2 }}>
                        {session.is_full_session ? '✓ Sessão completa' : `${exScores.length} exercício${exScores.length !== 1 ? 's' : ''} avulso${exScores.length !== 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: grade, lineHeight: 1 }}>{avg}</div>
                      <div style={{ fontSize: 7, color: '#3A5470', fontFamily: 'JetBrains Mono' }}>MÉD.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {exScores.map((sc, j) => {
                      const ex = EXERCISES.find(e => e.id === sc.exercise_id)
                      if (!ex) return null
                      return (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, flexShrink: 0 }}>{ex.icon}</span>
                          <div style={{ flex: 1, height: 3, background: '#162030', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${sc.points}%`, height: '100%', background: ex.color }} />
                          </div>
                          <span style={{ fontSize: 10, color: ex.color, fontWeight: 700, fontFamily: 'JetBrains Mono', minWidth: 24, textAlign: 'right' }}>{sc.points}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrap>
  )
}
