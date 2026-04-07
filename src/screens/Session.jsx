import { useState, useEffect, useRef } from 'react'
import { EXERCISES, BREATHING, getDifficulty, UNLOCK_THRESHOLD } from '../constants.js'
import { Shell, PageWrap } from '../components/UI.jsx'
import { UFOVGame, DualNBackGame, SequenceGame, StroopGame, TaskSwitchingGame, BreathingGame } from '../games/index.jsx'

const GAMES = {
  ufov: UFOVGame, nback: DualNBackGame, sequence: SequenceGame,
  stroop: StroopGame, switching: TaskSwitchingGame, breathing: BreathingGame,
}

/* ── INTRO ── */
function Intro({ ex, difficulty, countdown, stepIdx, stepCount, isSingle }) {
  const lvlColors = ['#22D3EE', '#F59E0B', '#EF4444']
  const lc = lvlColors[(difficulty?.level ?? 1) - 1]
  return (
    <PageWrap center>
      <div className="fade" style={{ textAlign:'center', maxWidth:320 }}>
        <div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', letterSpacing:3, marginBottom:14 }}>
          {isSingle ? 'EXERCÍCIO AVULSO' : `${stepIdx+1} DE ${stepCount}`}
        </div>
        <div style={{ fontSize:54, marginBottom:10 }}>{ex.icon}</div>
        <div style={{ fontSize:24, fontWeight:800, color:'#E8F0FF', marginBottom:3 }}>{ex.name}</div>
        <div style={{ fontSize:9, color:ex.color, fontFamily:'JetBrains Mono', letterSpacing:2, marginBottom:6 }}>{ex.subtitle.toUpperCase()}</div>
        {difficulty && (
          <div style={{ display:'inline-block', padding:'4px 12px', borderRadius:8, background:`${lc}15`, border:`1px solid ${lc}40`, fontSize:10, color:lc, fontFamily:'JetBrains Mono', fontWeight:700, marginBottom:14 }}>
            NÍVEL {difficulty.level} — {difficulty.label}
          </div>
        )}
        <div style={{ fontSize:12, color:'#7090A8', lineHeight:1.65, marginBottom:26, padding:'12px 16px', background:'#0C1520', borderRadius:14, border:'1px solid #1A2A3A', textAlign:'left' }}>
          {(ex.howToPlay ?? [ex.instruction]).map((s,i) => <div key={i} style={{ marginBottom:3 }}>• {s}</div>)}
        </div>
        <div key={countdown} style={{ fontSize:58, fontWeight:800, color:ex.color, animation:'pop 1s ease both', lineHeight:1 }}>{countdown}</div>
        <div style={{ fontSize:10, color:'#3A5470', marginTop:8, fontFamily:'JetBrains Mono' }}>começando em...</div>
      </div>
    </PageWrap>
  )
}

/* ── RESULT ── */
function Result({ score, ex, difficulty, leveledUp, newLevel, onNext, nextEx, nextDiff, isSingle, onHome }) {
  const pts = score?.points ?? 0
  const grade = pts>=80?{l:'Excelente 🔥',c:'#34D399'}:pts>=60?{l:'Muito bom',c:'#22D3EE'}:pts>=40?{l:'Regular',c:'#F59E0B'}:{l:'Continue',c:'#EF4444'}
  const r=52; const circ=2*Math.PI*r

  return (
    <PageWrap center>
      <div className="fade" style={{ width:'100%', maxWidth:320, textAlign:'center' }}>
        <div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', letterSpacing:2, marginBottom:10 }}>{ex.name} — RESULTADO</div>
        <div style={{ position:'relative', width:130, height:130, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="130" height="130" style={{ position:'absolute', transform:'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r={r} fill="none" stroke="#162030" strokeWidth="5" />
            <circle cx="65" cy="65" r={r} fill="none" stroke={grade.c} strokeWidth="5" strokeDasharray={`${circ*pts/100} ${circ}`} strokeLinecap="round" />
          </svg>
          <div><div style={{ fontSize:34, fontWeight:800, color:grade.c, lineHeight:1 }}>{pts}</div><div style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono' }}>PONTOS</div></div>
        </div>
        <div style={{ fontSize:17, fontWeight:700, color:grade.c, marginBottom:4 }}>{grade.l}</div>
        <div style={{ fontSize:11, color:'#7090A8', fontFamily:'JetBrains Mono', marginBottom:2 }}>{score?.label}</div>
        <div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', marginBottom:leveledUp ? 14 : 22 }}>{score?.detail}</div>

        {/* Level up — only shows in full session, active NEXT session */}
        {leveledUp && (
          <div className="slide" style={{ padding:'12px 16px', background:'#0B1E14', borderRadius:12, border:'1px solid #34D39940', marginBottom:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>🏆</span>
              <div style={{ textAlign:'left' }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#34D399' }}>Nível {newLevel} desbloqueado!</div>
                <div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', marginTop:2 }}>
                  {getDifficulty(ex, newLevel)?.label} — ativo na próxima sessão
                </div>
              </div>
            </div>
          </div>
        )}

        {!isSingle && nextEx && (
          <div style={{ padding:'10px 13px', background:'#0A1520', borderRadius:12, border:'1px solid #1A2A3A', marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:17 }}>{nextEx.icon}</span>
            <div style={{ textAlign:'left', flex:1 }}>
              <div style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono' }}>A SEGUIR</div>
              <div style={{ fontSize:12, fontWeight:600, color:'#C0D0E0' }}>{nextEx.name}</div>
            </div>
            {nextDiff && <div style={{ fontSize:9, color:'#5B7A9A', fontFamily:'JetBrains Mono' }}>L{nextDiff.level}</div>}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {!isSingle && (
            <button onClick={onNext} style={{ width:'100%', padding:'14px', borderRadius:13, background:`${ex.color}12`, border:`2px solid ${ex.color}40`, color:ex.color, fontSize:13, fontWeight:800, letterSpacing:2 }}>
              {nextEx ? 'PRÓXIMO →' : 'VER RESUMO →'}
            </button>
          )}
          <button onClick={onHome} style={{ width:'100%', padding:'12px', borderRadius:13, background:'none', border:'1px solid #1A2A3A', color:'#5B7A9A', fontSize:12, fontWeight:700, letterSpacing:1.5 }}>← INÍCIO</button>
        </div>
      </div>
    </PageWrap>
  )
}

/* ── COMPLETE ── */
function Complete({ scores, exList, streak, levelUps, onHome }) {
  const total = Math.round(scores.reduce((a,s)=>a+(s.points??0),0)/scores.length)
  const grade = total>=80?'Dia excepcional 🏆':total>=65?'Muito bem 🔥':total>=50?'Bom trabalho ✓':'Amanhã vai melhor 💪'
  const r=44; const circ=2*Math.PI*r

  return (
    <PageWrap>
      <div className="fade" style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:46, marginBottom:7 }}>🧠</div>
          <div style={{ fontSize:22, fontWeight:800, color:'#E8F0FF', marginBottom:4 }}>Sessão Completa!</div>
          <div style={{ fontSize:11, color:'#FCD34D', fontFamily:'JetBrains Mono' }}>🔥 {streak} dia{streak!==1?'s':''} de streak</div>
        </div>

        {/* Level-ups summary */}
        {levelUps.length > 0 && (
          <div style={{ background:'#0B1E14', borderRadius:14, padding:'12px 16px', marginBottom:13, border:'1px solid #34D39930' }}>
            <div style={{ fontSize:8, color:'#34D399', fontFamily:'JetBrains Mono', letterSpacing:2, marginBottom:8 }}>NÍVEIS DESBLOQUEADOS — ATIVOS AMANHÃ</div>
            {levelUps.map(lu => (
              <div key={lu.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                <span style={{ fontSize:14 }}>{lu.icon}</span>
                <span style={{ fontSize:11, color:'#C0D0E0' }}>{lu.name}</span>
                <span style={{ fontSize:10, color:'#34D399', fontFamily:'JetBrains Mono', marginLeft:'auto' }}>→ L{lu.newLevel}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ background:'#0A1520', borderRadius:18, padding:'16px 20px', marginBottom:13, border:'1px solid #22D3EE15', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ position:'relative', width:96, height:96, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="96" height="96" style={{ position:'absolute', transform:'rotate(-90deg)' }}>
              <circle cx="48" cy="48" r={r} fill="none" stroke="#162030" strokeWidth="5" />
              <circle cx="48" cy="48" r={r} fill="none" stroke="#22D3EE" strokeWidth="5" strokeDasharray={`${circ*total/100} ${circ}`} strokeLinecap="round" />
            </svg>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:800, color:'#22D3EE', lineHeight:1 }}>{total}</div>
              <div style={{ fontSize:7, color:'#3A5470', fontFamily:'JetBrains Mono' }}>MÉD.</div>
            </div>
          </div>
          <div><div style={{ fontSize:16, fontWeight:700, color:'#E8F0FF' }}>{grade}</div><div style={{ fontSize:9, color:'#3A5470', fontFamily:'JetBrains Mono', marginTop:4 }}>média da sessão</div></div>
        </div>

        <div style={{ background:'#0A1520', borderRadius:18, padding:'14px 16px', marginBottom:18, border:'1px solid #1A2A3A' }}>
          <div style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono', letterSpacing:2, marginBottom:10 }}>POR EXERCÍCIO</div>
          {scores.map((sc, i) => {
            const ex = exList[i]; if (!ex) return null
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                <span style={{ fontSize:13, flexShrink:0 }}>{ex.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:11, color:'#C0D0E0', fontWeight:600 }}>{ex.name}</span>
                    <span style={{ fontSize:11, color:ex.color, fontWeight:700, fontFamily:'JetBrains Mono' }}>{sc.points??0}</span>
                  </div>
                  <div style={{ height:3, background:'#162030', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${sc.points??0}%`, height:'100%', background:ex.color }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={onHome} style={{ width:'100%', padding:'16px', borderRadius:15, background:'linear-gradient(135deg, #22D3EE, #3B82F6)', border:'none', color:'#070B14', fontSize:14, fontWeight:800, letterSpacing:2.5, boxShadow:'0 6px 24px #22D3EE22' }}>INÍCIO</button>
      </div>
    </PageWrap>
  )
}

/* ════════════════════════════════════════════
   SESSION CONTROLLER
════════════════════════════════════════════ */
export default function Session({ profile, exIndices, isSingle, levels, onLevelUp, onComplete, onQuit }) {
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState('intro')
  const [scores, setScores] = useState([])
  const [curScore, setCurScore] = useState(null)
  const [leveledUp, setLeveledUp] = useState(false)
  const [newLevel, setNewLevel] = useState(null)
  const [levelUps, setLevelUps] = useState([])   // for complete screen summary
  const [countdown, setCountdown] = useState(3)

  // ── KEY: snapshot levels at session start, never update mid-session ──
  // This ensures you play today's session at today's level.
  // Any level-ups take effect only on the NEXT session.
  const sessionLevels = useRef(levels)

  const exercises = exIndices.map(i => i === 'breathing' ? BREATHING : EXERCISES[i])
  const ex = exercises[step]
  const isBreathing = ex?.id === 'breathing'

  const getDiff = (idx) => {
    const e = exercises[idx]
    if (!e || e.id === 'breathing') return null
    const journeyLevel = sessionLevels.current?.[e.id]?.journey ?? 1
    return getDifficulty(e, journeyLevel)
  }

  const diff = getDiff(step)
  const gameConfig = isBreathing ? { ...BREATHING } : { ...ex, ...diff }
  const nextEx = step < exercises.length - 1 ? exercises[step + 1] : null
  const nextDiff = step < exercises.length - 1 ? getDiff(step + 1) : null

  useEffect(() => {
    if (phase !== 'intro') return
    setCountdown(3); let c = 3
    const t = setInterval(() => { c--; if (c<=0) { clearInterval(t); setPhase('exercise') } else setCountdown(c) }, 1000)
    return () => clearInterval(t)
  }, [phase, step])

  const handleExComplete = (score) => {
    const tagged = { ...score, id: ex.id }
    const newScores = [...scores, tagged]
    setScores(newScores); setCurScore(tagged)

    // Level-up: only on full sessions, not single/avulso
    let didLevelUp = false; let nl = null
    if (!isSingle && !isBreathing && diff) {
      const threshold = UNLOCK_THRESHOLD[diff.level]
      const currentJourney = sessionLevels.current?.[ex.id]?.journey ?? 1
      const currentUnlocked = sessionLevels.current?.[ex.id]?.unlocked ?? 1
      if (threshold && score.points >= threshold && currentJourney < 3) {
        nl = currentJourney + 1
        didLevelUp = true
        // Save to DB and parent state (for tomorrow), but DON'T update sessionLevels
        onLevelUp(ex.id, nl, Math.max(nl, currentUnlocked))
        setLevelUps(prev => [...prev, { id: ex.id, icon: ex.icon, name: ex.name, newLevel: nl }])
      }
    }
    setLeveledUp(didLevelUp); setNewLevel(nl)

    if (step >= exercises.length - 1) {
      onComplete(newScores, isSingle)
      setPhase('complete')
    } else {
      setPhase('result')
    }
  }

  const handleNext = () => { setStep(s=>s+1); setCurScore(null); setLeveledUp(false); setNewLevel(null); setPhase('intro') }

  if (phase === 'intro') return <Intro ex={ex} difficulty={diff} countdown={countdown} stepIdx={step} stepCount={exercises.length} isSingle={isSingle} />

  if (phase === 'exercise') {
    const Game = GAMES[ex.id]
    return (
      <Shell ex={ex} exIdx={step} exercises={exercises} onQuit={onQuit}>
        <Game config={gameConfig} onComplete={handleExComplete} />
      </Shell>
    )
  }

  if (phase === 'result') return (
    <Result score={curScore} ex={ex} difficulty={diff} leveledUp={leveledUp} newLevel={newLevel}
      onNext={handleNext} nextEx={nextEx} nextDiff={nextDiff} isSingle={isSingle} onHome={onQuit} />
  )

  if (phase === 'complete') return (
    <Complete scores={scores} exList={exercises} streak={profile.currentStreak ?? 0} levelUps={levelUps} onHome={onQuit} />
  )

  return null
}
