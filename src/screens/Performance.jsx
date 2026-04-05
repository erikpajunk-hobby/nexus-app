import { EXERCISES } from '../constants.js'
import { computeStats } from '../lib/db.js'
import { PageWrap, BackBtn, Card, Label, Sparkline } from '../components/UI.jsx'

const TREND = { up: { icon: '↑', color: '#34D399' }, down: { icon: '↓', color: '#EF4444' }, same: { icon: '→', color: '#5B7A9A' } }

function StatBox({ value, label, sub, color = '#22D3EE' }) {
  return (
    <div style={{ flex: 1, background: '#0C1520', borderRadius: 14, padding: '14px 12px', border: '1px solid #1A2A3A', textAlign: 'center' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: '#C0D0E0', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function RingScore({ value, color, size = 80 }) {
  const r = size / 2 - 6; const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#162030" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${circ * value / 100} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: size > 70 ? 18 : 14, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      </div>
    </div>
  )
}

export default function Performance({ profile, sessions, onBack }) {
  const stats = computeStats(sessions)

  if (!stats || stats.totalSessions === 0) {
    return (
      <PageWrap>
        <div className="fade" style={{ width: '100%', maxWidth: 360 }}>
          <BackBtn onClick={onBack} />
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#3A5470', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📊</div>
            <div style={{ color: '#E8F0FF', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sem dados ainda</div>
            Complete pelo menos uma sessão para ver seu desempenho.
          </div>
        </div>
      </PageWrap>
    )
  }

  return (
    <PageWrap>
      <div className="fade" style={{ width: '100%', maxWidth: 360 }}>
        <BackBtn onClick={onBack} />

        {/* Profile header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${profile.avatar_color}18`, border: `2px solid ${profile.avatar_color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: profile.avatar_color, flexShrink: 0 }}>
            {profile.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#E8F0FF' }}>{profile.name}</div>
            <div style={{ fontSize: 9, color: profile.avatar_color, fontFamily: 'JetBrains Mono', letterSpacing: 1.5 }}>DESEMPENHO</div>
          </div>
        </div>

        {/* Top stats */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <StatBox value={stats.streak} label="Streak Atual" sub={`melhor: ${stats.bestStreak}`} color="#FCD34D" />
          <StatBox value={stats.totalSessions} label="Sessões" sub={`${stats.sessionsThisWeek} esta semana`} color={profile.avatar_color} />
          <StatBox value={stats.overallAvg} label="Média Geral" sub="todos os tempos" color="#22D3EE" />
        </div>

        {/* Sparkline */}
        {stats.last10.length >= 2 && (
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Label>ÚLTIMAS {stats.last10.length} SESSÕES</Label>
              <span style={{ fontSize: 10, color: '#5B7A9A', fontFamily: 'JetBrains Mono' }}>
                {stats.last10[0]} → {stats.last10[stats.last10.length - 1]}
              </span>
            </div>
            <Sparkline data={stats.last10} color={profile.avatar_color} width={296} height={44} />
          </Card>
        )}

        {/* Per-exercise breakdown */}
        <Card style={{ marginBottom: 12 }}>
          <Label style={{ marginBottom: 14 }}>POR EXERCÍCIO</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {EXERCISES.map(ex => {
              const s = stats.exerciseStats[ex.id]
              if (!s) return null
              const t = TREND[s.trend]
              return (
                <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <RingScore value={s.avg} color={ex.color} size={52} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{ex.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#C0D0E0' }}>{ex.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: t.color, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{t.icon}</span>
                        <span style={{ fontSize: 10, color: '#5B7A9A', fontFamily: 'JetBrains Mono' }}>best {s.best}</span>
                      </div>
                    </div>
                    <div style={{ height: 4, background: '#162030', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${s.avg}%`, height: '100%', background: ex.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                    </div>
                    <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 3 }}>{s.count} sessões registradas</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Streak calendar — last 28 days */}
        <Card>
          <Label style={{ marginBottom: 12 }}>ÚLTIMOS 28 DIAS</Label>
          <CalendarGrid sessions={sessions} color={profile.avatar_color} />
        </Card>

      </div>
    </PageWrap>
  )
}

function CalendarGrid({ sessions, color }) {
  const days = []
  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0)
    days.push(d)
  }
  const sessionDates = new Set(
    (sessions || []).filter(s => s.is_full_session).map(s => new Date(s.created_at).toDateString())
  )
  const DOW = ['D','S','T','Q','Q','S','S']
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DOW.map((d,i) => <div key={i} style={{ textAlign:'center', fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono' }}>{d}</div>)}
      </div>
      {/* Pad to start on correct weekday */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array(days[0].getDay()).fill(null).map((_,i) => <div key={`pad-${i}`} />)}
        {days.map((d, i) => {
          const isToday = d.toDateString() === new Date().toDateString()
          const done = sessionDates.has(d.toDateString())
          return (
            <div key={i} style={{
              height: 28, borderRadius: 6,
              background: done ? `${color}30` : '#0C1520',
              border: `1px solid ${isToday ? color : done ? color + '40' : '#1A2A3A'}`,
              boxShadow: done ? `0 0 6px ${color}25` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {done && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
