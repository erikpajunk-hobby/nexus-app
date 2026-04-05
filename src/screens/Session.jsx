import { useState, useEffect } from 'react'
import { EXERCISES } from '../constants.js'
import { Shell, PageWrap } from '../components/UI.jsx'
import { UFOVGame, DualNBackGame, SequenceGame, StroopGame, BreathingGame } from '../games/index.jsx'

const GAMES = { ufov: UFOVGame, nback: DualNBackGame, sequence: SequenceGame, stroop: StroopGame, breathing: BreathingGame }

/* ── INTRO ── */
function Intro({ ex, countdown, stepIdx, stepCount, isSingle }) {
  return (
    <PageWrap center>
      <div className="fade" style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 3, marginBottom: 16 }}>
          {isSingle ? 'EXERCÍCIO AVULSO' : `EXERCÍCIO ${stepIdx + 1} DE ${stepCount}`}
        </div>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{ex.icon}</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#E8F0FF', marginBottom: 4 }}>{ex.name}</div>
        <div style={{ fontSize: 9, color: ex.color, fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 18 }}>{ex.subtitle.toUpperCase()}</div>
        <div style={{ fontSize: 13, color: '#7090A8', lineHeight: 1.65, marginBottom: 28, padding: '14px 18px', background: '#0C1520', borderRadius: 14, border: '1px solid #1A2A3A', textAlign: 'left' }}>
          {ex.instruction}
        </div>
        <div key={countdown} style={{ fontSize: 60, fontWeight: 800, color: ex.color, animation: 'pop 1s ease both', lineHeight: 1 }}>{countdown}</div>
        <div style={{ fontSize: 10, color: '#3A5470', marginTop: 8, fontFamily: 'JetBrains Mono' }}>começando em...</div>
      </div>
    </PageWrap>
  )
}

/* ── RESULT ── */
function Result({ score, ex, onNext, nextEx, isSingle, onHome }) {
  const pts = score?.points ?? 0
  const grade = pts >= 80 ? { l: 'Excelente 🔥', c: '#34D399' } : pts >= 60 ? { l: 'Muito bom', c: '#22D3EE' } : pts >= 40 ? { l: 'Regular', c: '#F59E0B' } : { l: 'Continue', c: '#EF4444' }
  const r = 52; const circ = 2 * Math.PI * r
  return (
    <PageWrap center>
      <div className="fade" style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 12 }}>{ex.name} — RESULTADO</div>
        <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="140" height="140" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
            <circle cx="70" cy="70" r={r} fill="none" stroke="#162030" strokeWidth="5" />
            <circle cx="70" cy="70" r={r} fill="none" stroke={grade.c} strokeWidth="5" strokeDasharray={`${circ * pts / 100} ${circ}`} strokeLinecap="round" />
          </svg>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: grade.c, lineHeight: 1 }}>{pts}</div>
            <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono' }}>PONTOS</div>
          </div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: grade.c, marginBottom: 4 }}>{grade.l}</div>
        <div style={{ fontSize: 11, color: '#7090A8', fontFamily: 'JetBrains Mono', marginBottom: 3 }}>{score?.label}</div>
        <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', marginBottom: 22 }}>{score?.detail}</div>

        {!isSingle && nextEx && (
          <div style={{ padding: '10px 14px', background: '#0A1520', borderRadius: 12, border: '1px solid #1A2A3A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>{nextEx.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono' }}>A SEGUIR</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#C0D0E0' }}>{nextEx.name}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!isSingle && (
            <button onClick={onNext} style={{ width: '100%', padding: '14px', borderRadius: 13, background: `${ex.color}12`, border: `2px solid ${ex.color}40`, color: ex.color, fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>
              {nextEx ? 'PRÓXIMO →' : 'VER RESUMO →'}
            </button>
          )}
          <button onClick={onHome} style={{ width: '100%', padding: '13px', borderRadius: 13, background: 'none', border: '1px solid #1A2A3A', color: '#5B7A9A', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>
            ← INÍCIO
          </button>
        </div>
      </div>
    </PageWrap>
  )
}

/* ── COMPLETE ── */
function Complete({ scores, streak, onHome }) {
  const total = Math.round(scores.reduce((a, s) => a + (s.points ?? 0), 0) / scores.length)
  const grade = total >= 80 ? 'Dia excepcional 🏆' : total >= 65 ? 'Muito bem 🔥' : total >= 50 ? 'Bom trabalho ✓' : 'Amanhã vai melhor 💪'
  const r = 44; const circ = 2 * Math.PI * r
  return (
    <PageWrap>
      <div className="fade" style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#E8F0FF', marginBottom: 4 }}>Sessão Completa!</div>
          <div style={{ fontSize: 11, color: '#FCD34D', fontFamily: 'JetBrains Mono' }}>🔥 {streak} dia{streak !== 1 ? 's' : ''} de streak</div>
        </div>

        <div style={{ background: '#0A1520', borderRadius: 18, padding: '18px 22px', marginBottom: 14, border: '1px solid #22D3EE15', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100" height="100" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r={r} fill="none" stroke="#162030" strokeWidth="5" />
              <circle cx="50" cy="50" r={r} fill="none" stroke="#22D3EE" strokeWidth="5" strokeDasharray={`${circ * total / 100} ${circ}`} strokeLinecap="round" />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#22D3EE', lineHeight: 1 }}>{total}</div>
              <div style={{ fontSize: 7, color: '#3A5470', fontFamily: 'JetBrains Mono' }}>MÉD.</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#E8F0FF' }}>{grade}</div>
            <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 4 }}>média da sessão</div>
          </div>
        </div>

        <div style={{ background: '#0A1520', borderRadius: 18, padding: '14px 18px', marginBottom: 18, border: '1px solid #1A2A3A' }}>
          <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 10 }}>POR EXERCÍCIO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scores.map((s, i) => {
              const ex = EXERCISES[i]
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{ex.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: '#C0D0E0', fontWeight: 600 }}>{ex.name}</span>
                      <span style={{ fontSize: 11, color: ex.color, fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{s.points ?? 0}</span>
                    </div>
                    <div style={{ height: 3, background: '#162030', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${s.points ?? 0}%`, height: '100%', background: ex.color }} />
                    </div>
                    <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={onHome} style={{ width: '100%', padding: '16px', borderRadius: 15, background: 'linear-gradient(135deg, #22D3EE, #3B82F6)', border: 'none', color: '#070B14', fontSize: 14, fontWeight: 800, letterSpacing: 2.5, boxShadow: '0 6px 24px #22D3EE25' }}>
          INÍCIO
        </button>
      </div>
    </PageWrap>
  )
}

/* ── SESSION CONTROLLER ── */
export default function Session({ profile, exIndices, isSingle, onComplete, onQuit }) {
  const [step, setStep] = useState(0)               // which exercise in the session
  const [phase, setPhase] = useState('intro')        // intro | exercise | result | complete
  const [scores, setScores] = useState([])
  const [curScore, setCurScore] = useState(null)
  const [countdown, setCountdown] = useState(3)

  const exercises = exIndices.map(i => EXERCISES[i])
  const ex = exercises[step]
  const nextEx = step < exercises.length - 1 ? exercises[step + 1] : null

  useEffect(() => {
    if (phase !== 'intro') return
    setCountdown(3); let c = 3
    const t = setInterval(() => { c--; if (c <= 0) { clearInterval(t); setPhase('exercise') } else setCountdown(c) }, 1000)
    return () => clearInterval(t)
  }, [phase, step])

  const handleExComplete = (score) => {
    const tagged = { ...score, id: ex.id }
    const newScores = [...scores, tagged]
    setScores(newScores); setCurScore(tagged)
    if (step >= exercises.length - 1) {
      onComplete(newScores, isSingle)
      setPhase('complete')
    } else {
      setPhase('result')
    }
  }

  const handleNext = () => { setStep(s => s + 1); setCurScore(null); setPhase('intro') }

  const streak = (() => {
    // placeholder — passed from above in real use
    return profile.currentStreak ?? 0
  })()

  if (phase === 'intro') return <Intro ex={ex} countdown={countdown} stepIdx={step} stepCount={exercises.length} isSingle={isSingle} />

  if (phase === 'exercise') {
    const Game = GAMES[ex.id]
    return (
      <Shell ex={ex} exIdx={step} exercises={exercises} onQuit={onQuit}>
        <Game config={ex} onComplete={handleExComplete} />
      </Shell>
    )
  }

  if (phase === 'result') return <Result score={curScore} ex={ex} onNext={handleNext} nextEx={nextEx} isSingle={isSingle} onHome={onQuit} />
  if (phase === 'complete') return <Complete scores={scores} streak={streak} onHome={onQuit} />

  return null
}
