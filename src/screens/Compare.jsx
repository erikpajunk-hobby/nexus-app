import { useState, useEffect } from 'react'
import { getProfiles, getSessions, computeStats } from '../lib/db.js'
import { EXERCISES } from '../constants.js'
import { PageWrap, BackBtn, Card, Label, Spinner } from '../components/UI.jsx'

function CompareBar({ valA, valB, colorA, colorB, label }) {
  const max = Math.max(valA, valB, 1)
  const winner = valA > valB ? 'A' : valB > valA ? 'B' : null
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: winner === 'A' ? 800 : 400, color: winner === 'A' ? colorA : '#7090A8' }}>{valA}</span>
        <span style={{ fontSize: 10, color: '#5B7A9A', fontFamily: 'JetBrains Mono' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: winner === 'B' ? 800 : 400, color: winner === 'B' ? colorB : '#7090A8' }}>{valB}</span>
      </div>
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 }}>
        <div style={{ flex: valA / max, background: colorA, borderRadius: 3, minWidth: valA > 0 ? 4 : 0, transition: 'flex 0.8s ease' }} />
        <div style={{ flex: (max - valA) / max, background: '#162030' }} />
      </div>
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2, marginTop: 2 }}>
        <div style={{ flex: valB / max, background: colorB, borderRadius: 3, minWidth: valB > 0 ? 4 : 0, transition: 'flex 0.8s ease' }} />
        <div style={{ flex: (max - valB) / max, background: '#162030' }} />
      </div>
    </div>
  )
}

export default function Compare({ currentProfile, onBack }) {
  const [profiles, setProfiles] = useState([])
  const [other, setOther] = useState(null)
  const [statsA, setStatsA] = useState(null)
  const [statsB, setStatsB] = useState(null)
  const [sessionsA, setSessionsA] = useState(null)
  const [sessionsB, setSessionsB] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [allProfiles, mySessions] = await Promise.all([
        getProfiles(),
        getSessions(currentProfile.id),
      ])
      const others = allProfiles.filter(p => p.id !== currentProfile.id)
      setProfiles(others)
      setSessionsA(mySessions)
      setStatsA(computeStats(mySessions))
      // Auto-select the only other profile if just 2 total
      if (others.length === 1) {
        const theirSessions = await getSessions(others[0].id)
        setOther(others[0]); setSessionsB(theirSessions); setStatsB(computeStats(theirSessions))
      }
      setLoading(false)
    })()
  }, [])

  const selectOther = async (p) => {
    setOther(p); setStatsB(null)
    const s = await getSessions(p.id)
    setSessionsB(s); setStatsB(computeStats(s))
  }

  if (loading) return <Spinner />

  const pA = currentProfile
  const pB = other

  const wins = () => {
    if (!statsA || !statsB) return { A: 0, B: 0 }
    let a = 0, b = 0
    EXERCISES.forEach(ex => {
      const sA = statsA.exerciseStats[ex.id]?.avg ?? 0
      const sB = statsB.exerciseStats[ex.id]?.avg ?? 0
      if (sA > sB) a++; else if (sB > sA) b++
    })
    if (statsA.streak > statsB.streak) a++; else if (statsB.streak > statsA.streak) b++
    return { A: a, B: b }
  }

  return (
    <PageWrap>
      <div className="fade" style={{ width: '100%', maxWidth: 360 }}>
        <BackBtn onClick={onBack} />

        <div style={{ fontSize: 20, fontWeight: 800, color: '#E8F0FF', marginBottom: 4 }}>Comparativo</div>
        <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 1.5, marginBottom: 22 }}>HEAD-TO-HEAD</div>

        {/* Profile selector for B */}
        {profiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#3A5470', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
            Nenhum outro perfil encontrado.<br />Crie um segundo perfil para comparar.
          </div>
        ) : (
          <>
            {profiles.length > 1 && !other && (
              <div style={{ marginBottom: 18 }}>
                <Label style={{ marginBottom: 10 }}>ESCOLHA QUEM COMPARAR</Label>
                {profiles.map(p => (
                  <button key={p.id} onClick={() => selectOther(p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 13, background: '#0C1520', border: `1px solid ${p.avatar_color}25`, marginBottom: 8, width: '100%', transition: 'all 0.15s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${p.avatar_color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: p.avatar_color }}>{p.name[0].toUpperCase()}</div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#E8F0FF' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            )}

            {pB && (
              <>
                {/* VS Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: `${pA.avatar_color}18`, border: `2px solid ${pA.avatar_color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: pA.avatar_color, margin: '0 auto 6px' }}>{pA.name[0].toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E8F0FF' }}>{pA.name}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#3A5470', padding: '0 10px' }}>VS</div>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 15, background: `${pB.avatar_color}18`, border: `2px solid ${pB.avatar_color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: pB.avatar_color, margin: '0 auto 6px' }}>{pB.name[0].toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E8F0FF' }}>{pB.name}</div>
                  </div>
                </div>

                {!statsB ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#3A5470', fontFamily: 'JetBrains Mono', fontSize: 10 }}>Carregando...</div>
                ) : (
                  <>
                    {/* Win tally */}
                    {(() => {
                      const w = wins()
                      const leader = w.A > w.B ? pA : w.B > w.A ? pB : null
                      const leaderColor = w.A > w.B ? pA.avatar_color : w.B > w.A ? pB.avatar_color : '#5B7A9A'
                      return (
                        <Card style={{ marginBottom: 12, textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: leaderColor, marginBottom: 4 }}>
                            {leader ? `${leader.name} está na frente` : 'Empate técnico'}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                            <div><div style={{ fontSize: 28, fontWeight: 800, color: pA.avatar_color }}>{w.A}</div><div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono' }}>VITÓRIAS</div></div>
                            <div style={{ width: 1, background: '#1A2A3A' }} />
                            <div><div style={{ fontSize: 28, fontWeight: 800, color: pB.avatar_color }}>{w.B}</div><div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono' }}>VITÓRIAS</div></div>
                          </div>
                          <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 6 }}>contando exercícios + streak</div>
                        </Card>
                      )
                    })()}

                    {/* Overall stats */}
                    <Card style={{ marginBottom: 12 }}>
                      <Label style={{ marginBottom: 14 }}>ESTATÍSTICAS GERAIS</Label>
                      <CompareBar valA={statsA.streak} valB={statsB.streak} colorA={pA.avatar_color} colorB={pB.avatar_color} label="Streak 🔥" />
                      <CompareBar valA={statsA.bestStreak} valB={statsB.bestStreak} colorA={pA.avatar_color} colorB={pB.avatar_color} label="Melhor streak" />
                      <CompareBar valA={statsA.totalSessions} valB={statsB.totalSessions} colorA={pA.avatar_color} colorB={pB.avatar_color} label="Sessões totais" />
                      <CompareBar valA={statsA.overallAvg} valB={statsB.overallAvg} colorA={pA.avatar_color} colorB={pB.avatar_color} label="Média geral" />
                      <CompareBar valA={statsA.sessionsThisWeek} valB={statsB.sessionsThisWeek} colorA={pA.avatar_color} colorB={pB.avatar_color} label="Essa semana" />
                    </Card>

                    {/* Per exercise */}
                    <Card>
                      <Label style={{ marginBottom: 14 }}>EXERCÍCIO A EXERCÍCIO</Label>
                      {EXERCISES.map(ex => {
                        const sA = statsA.exerciseStats[ex.id]?.avg ?? 0
                        const sB = statsB.exerciseStats[ex.id]?.avg ?? 0
                        return (
                          <div key={ex.id} style={{ marginBottom: 14 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <span style={{ fontSize: 14 }}>{ex.icon}</span>
                              <span style={{ fontSize: 11, color: '#C0D0E0', fontWeight: 600 }}>{ex.name}</span>
                            </div>
                            <CompareBar valA={sA} valB={sB} colorA={pA.avatar_color} colorB={pB.avatar_color} label="avg" />
                          </div>
                        )
                      })}
                    </Card>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </PageWrap>
  )
}
