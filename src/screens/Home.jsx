import { EXERCISES, SESSION_DURATION_MIN, getDifficulty } from '../constants.js'
import { PageWrap } from '../components/UI.jsx'

const LEVEL_COLORS = ['#22D3EE', '#F59E0B', '#EF4444']

export default function Home({ profile, sessions, levels, onStartFull, onStartSingle, onBreathing, onPerformance, onHistory, onCompare, onHowToPlay, onSwitchProfile }) {
  const today = new Date().toDateString()
  const isWeekend = [0, 6].includes(new Date().getDay())
  const alreadyDone = sessions?.some(s => s.is_full_session && new Date(s.created_at).toDateString() === today)

  const fullSessions = sessions?.filter(s => s.is_full_session) ?? []
  const streak = (() => {
    if (!fullSessions.length) return 0
    const dates = [...new Set(fullSessions.map(s => new Date(s.created_at).toDateString()))].map(d => new Date(d)).sort((a,b)=>b-a)
    const todayD = new Date(); todayD.setHours(0,0,0,0)
    const yest = new Date(todayD); yest.setDate(todayD.getDate()-1)
    const first = new Date(dates[0]); first.setHours(0,0,0,0)
    if (first < yest) return 0
    let s=1; let prev=first
    for (let i=1; i<dates.length; i++) {
      const d=new Date(dates[i]); d.setHours(0,0,0,0)
      if ((prev-d)/86400000===1) { s++; prev=d } else break
    }
    return s
  })()

  return (
    <PageWrap>
      <div className="fade" style={{ width:'100%', maxWidth:360 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', letterSpacing:3 }}>NEXUS</div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:4 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:`${profile.avatar_color}18`, border:`2px solid ${profile.avatar_color}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:profile.avatar_color }}>{profile.name[0].toUpperCase()}</div>
              <div style={{ fontSize:20, fontWeight:800, color:'#E8F0FF' }}>{profile.name}</div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:30, fontWeight:800, color:'#FCD34D', lineHeight:1 }}>{streak}</div>
              <div style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono', letterSpacing:1 }}>STREAK 🔥</div>
            </div>
            <button onClick={onSwitchProfile} style={{ background:'#0C1520', border:'1px solid #1A2A3A', borderRadius:8, padding:'6px 10px', color:'#5B7A9A', fontSize:10, fontFamily:'JetBrains Mono', letterSpacing:1 }}>↩ TROCAR</button>
          </div>
        </div>

        {/* Status banner */}
        {alreadyDone && (
          <div style={{ background:'#0B1E14', border:'1px solid #34D39930', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:24 }}>✅</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#34D399' }}>Sessão de hoje completa!</div>
              <div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', marginTop:2 }}>Volte amanhã para manter o streak</div>
            </div>
          </div>
        )}
        {!alreadyDone && isWeekend && (
          <div style={{ background:'#0A1420', border:'1px solid #60A5FA18', borderRadius:14, padding:'12px 16px', marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:24 }}>🌴</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#60A5FA' }}>Dia de descanso</div>
              <div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', marginTop:2 }}>Mas pode praticar se quiser!</div>
            </div>
          </div>
        )}

        {/* Full session button */}
        <button onClick={onStartFull} style={{
          width:'100%', padding:'17px 20px', borderRadius:16, marginBottom:12,
          background: alreadyDone ? '#0C1520' : 'linear-gradient(135deg, #22D3EE, #3B82F6)',
          border: alreadyDone ? '1px solid #1A2A3A' : 'none',
          color: alreadyDone ? '#5B7A9A' : '#070B14',
          fontSize:15, fontWeight:800, letterSpacing:2,
          boxShadow: alreadyDone ? 'none' : '0 6px 28px #22D3EE20',
          display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <span>{alreadyDone ? 'PRATICAR DE NOVO' : 'INICIAR SESSÃO'}</span>
          <span style={{ fontSize:11, fontFamily:'JetBrains Mono', opacity:0.7 }}>~{SESSION_DURATION_MIN} min →</span>
        </button>

        {/* Quick play — with level badges */}
        <div style={{ background:'#0A1520', borderRadius:16, padding:'14px 15px', marginBottom:12, border:'1px solid #1A2A3A' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:11 }}>
            <div style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono', letterSpacing:2 }}>EXERCÍCIO ESPECÍFICO</div>
            <button onClick={onHowToPlay} style={{ background:'none', border:'1px solid #1A2A3A', borderRadius:7, padding:'4px 8px', color:'#5B7A9A', fontSize:9, fontFamily:'JetBrains Mono', letterSpacing:1 }}>? COMO JOGAR</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {EXERCISES.map((ex, i) => {
              const journeyLevel = levels?.[ex.id]?.journey ?? 1
              const unlockedLevel = levels?.[ex.id]?.unlocked ?? 1
              const diff = getDifficulty(ex, journeyLevel)
              const lc = LEVEL_COLORS[journeyLevel - 1]
              return (
                <button key={ex.id} onClick={() => onStartSingle(i)} style={{ display:'flex', alignItems:'center', gap:11, padding:'9px 11px', borderRadius:12, background:'#0C1520', border:`1px solid ${ex.color}18`, textAlign:'left', transition:'all 0.15s', width:'100%' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=ex.color+'50'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=ex.color+'18'}
                >
                  <div style={{ width:32, height:32, borderRadius:9, background:`${ex.color}12`, border:`1px solid ${ex.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, flexShrink:0 }}>{ex.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#C0D0E0' }}>{ex.name}</div>
                    <div style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono', marginTop:1 }}>{diff.label} • {diff.duration}s</div>
                  </div>
                  {/* Level badge */}
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    {[1,2,3].map(l => (
                      <div key={l} style={{ width:8, height:8, borderRadius:'50%', background: l <= unlockedLevel ? (l === journeyLevel ? lc : lc+'60') : '#162030', transition:'background 0.3s' }} />
                    ))}
                  </div>
                  <span style={{ fontSize:11, color:ex.color, opacity:0.4 }}>→</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Breathing cool-down */}
        <button onClick={onBreathing} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 15px', borderRadius:14, background:'#0A1520', border:'1px solid #1A2A3A', marginBottom:12, transition:'all 0.2s', textAlign:'left' }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor='#60A5FA30'}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A2A3A'}}
        >
          <div style={{ width:34, height:34, borderRadius:10, background:'#60A5FA12', border:'1px solid #60A5FA25', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>🌊</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#C0D0E0' }}>Box Breathing</div>
            <div style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono', marginTop:1 }}>Descanso mental • 2 min • opcional</div>
          </div>
          <span style={{ fontSize:10, color:'#60A5FA', opacity:0.5 }}>→</span>
        </button>

        {/* Bottom nav */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
          {[
            { label:'📊 Desempenho', onClick:onPerformance },
            { label:'⚔️ Comparar',   onClick:onCompare },
            { label:'📋 Histórico',  onClick:onHistory },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{ padding:'11px 6px', borderRadius:12, background:'#0C1520', border:'1px solid #1A2A3A', color:'#7090A8', fontSize:10, fontWeight:700, transition:'all 0.2s', textAlign:'center' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#2A4060';e.currentTarget.style.color='#C0D0E0'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#1A2A3A';e.currentTarget.style.color='#7090A8'}}
            >{btn.label}</button>
          ))}
        </div>

      </div>
    </PageWrap>
  )
}
