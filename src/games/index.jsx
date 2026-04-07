import { useState, useEffect, useRef } from 'react'
import { Bar, Num } from '../components/UI.jsx'

/* ── Responsive scale ── */
function useScale() {
  const [s, setS] = useState(() => Math.min(window.innerWidth, 360) / 360)
  useEffect(() => {
    const h = () => setS(Math.min(window.innerWidth, 360) / 360)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return s
}
const sp = (v, s) => Math.round(v * s)

/* ════════════════════════════════════════════
   CAMPO VISUAL — UFOV
   config: { color, startMs, minMs, duration }
════════════════════════════════════════════ */
const SYMBOLS = ['●', '■', '▲', '◆']
const N_POS = 8
const coords = (idx, r) => {
  const a = (idx / N_POS) * 2 * Math.PI - Math.PI / 2
  return { x: Math.cos(a) * r, y: Math.sin(a) * r }
}

export function UFOVGame({ config, onComplete }) {
  const s = useScale()
  const arenaSize = sp(260, s)
  const CX = arenaSize / 2; const CY = arenaSize / 2
  const initR = sp(82, s)
  const initMs = config.startMs ?? 600
  const minMs = config.minMs ?? 400

  const [phase, setPhase] = useState('fixation')
  const [cStim, setCStim] = useState(null); const [pStim, setPStim] = useState(null)
  const [cAns, setCAns] = useState(null); const [pAns, setPAns] = useState(null)
  const [correct, setCorrect] = useState(0); const [total, setTotal] = useState(0)
  const [displayMs, setDisplayMs] = useState(initMs)
  const [radius, setRadius] = useState(initR)
  const [fb, setFb] = useState(null)
  const [timeLeft, setTimeLeft] = useState(config.duration)
  const [done, setDone] = useState(false)
  const R = useRef({ correct:0, total:0, displayMs:initMs, radius:initR, stim:{c:0,p:0}, cAns:null, pAns:null, awaiting:false, done:false })
  const rTimer = useRef(null); const tTimer = useRef(null)
  const evalRef = useRef(null); const runRef = useRef(null)

  useEffect(() => {
    const r = R.current
    const evaluate = () => {
      if (!r.awaiting) return; r.awaiting = false; clearTimeout(rTimer.current)
      const ok = r.cAns === r.stim.c && r.pAns === r.stim.p
      r.total++; setTotal(r.total)
      if (ok) {
        r.correct++; setCorrect(r.correct)
        if (r.correct % 3 === 0) {
          r.displayMs = Math.max(minMs, r.displayMs - 55); setDisplayMs(r.displayMs)
          r.radius = Math.min(sp(128, s), r.radius + sp(10, s)); setRadius(r.radius)
        }
      }
      setFb(ok ? 'hit' : 'miss'); setPhase('feedback')
      tTimer.current = setTimeout(() => runRef.current(), 380)
    }
    evalRef.current = evaluate
    const runTrial = () => {
      if (r.done) return
      r.stim = { c: Math.floor(Math.random()*4), p: Math.floor(Math.random()*N_POS) }
      r.cAns = null; r.pAns = null; r.awaiting = false
      setCAns(null); setPAns(null); setFb(null); setPhase('fixation'); setCStim(null); setPStim(null)
      setTimeout(() => {
        if (r.done) return; setPhase('display'); setCStim(r.stim.c); setPStim(r.stim.p)
        setTimeout(() => {
          if (r.done) return; setPhase('response'); setCStim(null); setPStim(null); r.awaiting = true
          rTimer.current = setTimeout(() => { if (r.awaiting) evaluate() }, 2600)
        }, r.displayMs)
      }, 340)
    }
    runRef.current = runTrial
    const timer = setInterval(() => setTimeLeft(t => {
      if (t<=1) { clearInterval(timer); r.done=true; clearTimeout(rTimer.current); clearTimeout(tTimer.current); setDone(true); return 0 }
      return t-1
    }), 1000)
    runTrial()
    return () => { clearInterval(timer); clearTimeout(rTimer.current); clearTimeout(tTimer.current); r.done=true }
  }, [])

  const handleC = (idx) => { const r=R.current; if (!r.awaiting) return; r.cAns=idx; setCAns(idx); if (r.pAns!==null) evalRef.current() }
  const handleP = (idx) => { const r=R.current; if (!r.awaiting) return; r.pAns=idx; setPAns(idx); if (r.cAns!==null) evalRef.current() }

  useEffect(() => {
    if (!done) return
    const r = R.current; const acc = r.total>0 ? Math.round(r.correct/r.total*100) : 0
    onComplete({ points: acc, label: `${r.correct}/${r.total} corretos • flash ${r.displayMs}ms`, detail: `Campo raio ${r.radius}px` })
  }, [done])

  const pct = ((config.duration - timeLeft) / config.duration) * 100
  const isResp = phase === 'response'
  const symW = sp(54, s); const periW = sp(36, s); const ctrW = sp(52, s)
  const hint = phase==='fixation'?'Foque no +':phase==='display'?'👁 OBSERVE!':phase==='response'?'Clique símbolo + posição':fb==='hit'?'✓':'✗'

  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:sp(12,s) }}>
      <Bar pct={pct} color={config.color} timeLeft={timeLeft} />
      <div style={{ display:'flex', gap:sp(16,s), alignItems:'flex-end' }}>
        <Num label="Corretos" value={correct} color={config.color} />
        <Num label="Total" value={total} color="#5B7A9A" />
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:sp(16,s), fontWeight:800, color:'#FCD34D', lineHeight:1 }}>{displayMs}</div>
          <div style={{ fontSize:7, color:'#3A5470', fontFamily:'JetBrains Mono' }}>FLASH MS</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:sp(8,s) }}>
        {SYMBOLS.map((sym, idx) => (
          <button key={idx} onClick={() => handleC(idx)} style={{ width:symW, height:symW, borderRadius:sp(13,s), background:cAns===idx?`${config.color}30`:phase==='display'&&cStim===idx?`${config.color}18`:'#0C1520', border:`2px solid ${cAns===idx?config.color:phase==='display'&&cStim===idx?config.color:'#1A2A3A'}`, color:cAns===idx?config.color:isResp?'#708090':'#2A3A4A', fontSize:sp(22,s), transition:'all 0.12s' }}>{sym}</button>
        ))}
      </div>
      <div style={{ position:'relative', width:arenaSize, height:arenaSize }}>
        <div style={{ position:'absolute', width:radius*2+sp(40,s), height:radius*2+sp(40,s), borderRadius:'50%', border:`1px solid ${config.color}14`, left:CX-radius-sp(20,s), top:CY-radius-sp(20,s), pointerEvents:'none', transition:'all 0.6s' }} />
        {Array(N_POS).fill(null).map((_, idx) => {
          const { x, y } = coords(idx, radius); const isA=phase==='display'&&pStim===idx; const isSel=pAns===idx
          return <button key={idx} onClick={() => handleP(idx)} style={{ position:'absolute', left:CX+x-periW/2, top:CY+y-periW/2, width:periW, height:periW, borderRadius:'50%', background:isA?config.color:isSel?`${config.color}30`:'#0C1520', border:`2px solid ${isA||isSel?config.color:'#1A2A3A'}`, boxShadow:isA?`0 0 20px ${config.color}`:'none', transition:'all 0.08s' }} />
        })}
        <div style={{ position:'absolute', left:CX-ctrW/2, top:CY-ctrW/2, width:ctrW, height:ctrW, borderRadius:sp(13,s), background:phase==='display'?`${config.color}20`:'#0C1520', border:`2px solid ${phase==='display'?config.color:'#1A2A3A'}`, display:'flex', alignItems:'center', justifyContent:'center', userSelect:'none' }}>
          <span style={{ fontSize:sp(22,s), color:config.color, fontWeight:800 }}>{phase==='display'&&cStim!==null?SYMBOLS[cStim]:phase==='response'?'?':'+'}</span>
        </div>
      </div>
      <p style={{ color:phase==='response'?config.color:'#3A5470', fontSize:sp(10,s), fontFamily:'JetBrains Mono', textAlign:'center', transition:'color 0.3s' }}>{hint}</p>
    </div>
  )
}

/* ════════════════════════════════════════════
   DUAL N-BACK
   config: { color, n, duration }
════════════════════════════════════════════ */
const NB_LETTERS = ['A','B','C','D','E','F','G','H']

export function DualNBackGame({ config, onComplete }) {
  const s = useScale()
  const N = config.n ?? 2
  const cellSize = sp(66, s)

  const [activeCell, setActiveCell] = useState(null); const [activeLetter, setActiveLetter] = useState(null)
  const [posHits, setPosHits] = useState(0); const [letHits, setLetHits] = useState(0)
  const [posMisses, setPosMisses] = useState(0); const [letMisses, setLetMisses] = useState(0)
  const [posFa, setPosFa] = useState(0); const [letFa, setLetFa] = useState(0)
  const [posFb, setPosFb] = useState(null); const [letFb, setLetFb] = useState(null)
  const [timeLeft, setTimeLeft] = useState(config.duration); const [done, setDone] = useState(false); const [step, setStep] = useState(0)
  const posSeq=useRef([]); const letSeq=useRef([])
  const posRsp=useRef(false); const letRsp=useRef(false)
  const prevPosM=useRef(false); const prevLetM=useRef(false)
  const pH=useRef(0); const lH=useRef(0); const pM=useRef(0); const lM=useRef(0); const pF=useRef(0); const lF=useRef(0)
  const doneRef=useRef(false)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => {
      if (t<=1) { clearInterval(timer); clearInterval(stepper); doneRef.current=true; setDone(true); return 0 }
      return t-1
    }), 1000)
    const stepper = setInterval(() => {
      if (doneRef.current) return
      if (prevPosM.current && !posRsp.current) { pM.current++; setPosMisses(pM.current) }
      if (prevLetM.current && !letRsp.current) { lM.current++; setLetMisses(lM.current) }
      const newPos=Math.floor(Math.random()*9); const newL=Math.floor(Math.random()*8)
      posSeq.current.push(newPos); letSeq.current.push(newL)
      const idx=posSeq.current.length-1
      posRsp.current=false; letRsp.current=false
      prevPosM.current=idx>=N&&posSeq.current[idx]===posSeq.current[idx-N]
      prevLetM.current=idx>=N&&letSeq.current[idx]===letSeq.current[idx-N]
      setActiveCell(newPos); setActiveLetter(NB_LETTERS[newL]); setStep(idx+1)
      setTimeout(() => { if (!doneRef.current) { setActiveCell(null); setActiveLetter(null) } }, 1500)
    }, 2000)
    return () => { clearInterval(timer); clearInterval(stepper) }
  }, [])

  const handlePos = () => {
    if (doneRef.current||posRsp.current) return; posRsp.current=true
    const idx=posSeq.current.length-1; const ok=idx>=N&&posSeq.current[idx]===posSeq.current[idx-N]
    if (ok) { pH.current++; setPosHits(pH.current); setPosFb('hit') } else { pF.current++; setPosFa(pF.current); setPosFb('miss') }
    setTimeout(() => setPosFb(null), 500)
  }
  const handleLet = () => {
    if (doneRef.current||letRsp.current) return; letRsp.current=true
    const idx=letSeq.current.length-1; const ok=idx>=N&&letSeq.current[idx]===letSeq.current[idx-N]
    if (ok) { lH.current++; setLetHits(lH.current); setLetFb('hit') } else { lF.current++; setLetFa(lF.current); setLetFb('miss') }
    setTimeout(() => setLetFb(null), 500)
  }

  useEffect(() => {
    if (!done) return
    const pt=pH.current+pM.current; const lt=lH.current+lM.current
    const pp=pt>0?Math.max(0,(pH.current-pF.current*0.5)/pt*100):0
    const lp=lt>0?Math.max(0,(lH.current-lF.current*0.5)/lt*100):0
    onComplete({ points:Math.min(100,Math.round((pp+lp)/2)), label:`Pos ${pH.current}✓${pM.current}✗ • Let ${lH.current}✓${lM.current}✗`, detail:`FA: pos ${pF.current} let ${lF.current}` })
  }, [done])

  const pct = ((config.duration-timeLeft)/config.duration)*100
  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:sp(12,s) }}>
      <Bar pct={pct} color={config.color} timeLeft={timeLeft} />
      <div style={{ fontSize:9, color:config.color, fontFamily:'JetBrains Mono', letterSpacing:2 }}>N = {N}</div>
      <div style={{ display:'flex', gap:6, padding:`${sp(8,s)}px ${sp(12,s)}px`, background:'#0C1520', borderRadius:12, border:'1px solid #1A2A3A' }}>
        <div style={{ paddingRight:sp(10,s), borderRight:'1px solid #1A2A3A' }}>
          <div style={{ fontSize:8, color:config.color, fontFamily:'JetBrains Mono', letterSpacing:1.5, marginBottom:4 }}>POSIÇÃO</div>
          <div style={{ display:'flex', gap:sp(8,s) }}><Num label="Hit" value={posHits} color={config.color} small /><Num label="Miss" value={posMisses} color="#EF4444" small /><Num label="FA" value={posFa} color="#F59E0B" small /></div>
        </div>
        <div style={{ paddingLeft:sp(10,s) }}>
          <div style={{ fontSize:8, color:'#F59E0B', fontFamily:'JetBrains Mono', letterSpacing:1.5, marginBottom:4 }}>LETRA</div>
          <div style={{ display:'flex', gap:sp(8,s) }}><Num label="Hit" value={letHits} color="#F59E0B" small /><Num label="Miss" value={letMisses} color="#EF4444" small /><Num label="FA" value={letFa} color="#F59E0B" small /></div>
        </div>
      </div>
      <div style={{ width:sp(80,s), height:sp(56,s), borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:activeLetter?`${config.color}15`:'#0C1520', border:`2px solid ${activeLetter?config.color:'#1A2A3A'}`, transition:'all 0.18s' }}>
        <span style={{ fontSize:sp(30,s), fontWeight:800, color:activeLetter?config.color:'#1A2A3A' }}>{activeLetter||'—'}</span>
      </div>
      <p style={{ color:'#3A5470', fontSize:sp(9,s), fontFamily:'JetBrains Mono' }}>Rodada {step} • compare com {N} passos atrás</p>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(3, ${cellSize}px)`, gap:sp(7,s) }}>
        {Array(9).fill(null).map((_,i) => (
          <div key={i} style={{ height:cellSize, borderRadius:sp(12,s), background:activeCell===i?`${config.color}20`:'#0C1520', border:`2px solid ${activeCell===i?config.color:'#1A2A3A'}`, boxShadow:activeCell===i?`0 0 14px ${config.color}28`:'none', transition:'all 0.18s' }} />
        ))}
      </div>
      <div style={{ display:'flex', gap:sp(10,s) }}>
        {[{sub:'POSIÇÃO',fb:posFb,color:config.color,onClick:handlePos},{sub:'LETRA',fb:letFb,color:'#F59E0B',onClick:handleLet}].map(btn => (
          <button key={btn.sub} onClick={btn.onClick} style={{ padding:`${sp(11,s)}px ${sp(20,s)}px`, borderRadius:12, transition:'all 0.15s', background:btn.fb==='hit'?'#34D39918':btn.fb==='miss'?'#EF444418':`${btn.color}10`, border:`2px solid ${btn.fb==='hit'?'#34D399':btn.fb==='miss'?'#EF4444':btn.color}50`, color:btn.fb==='hit'?'#34D399':btn.fb==='miss'?'#EF4444':btn.color, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <span style={{ fontSize:sp(12,s), fontWeight:800, letterSpacing:2 }}>{btn.fb==='hit'?'✓':btn.fb==='miss'?'✗':'MATCH'}</span>
            <span style={{ fontSize:sp(8,s), fontFamily:'JetBrains Mono', letterSpacing:1.5, opacity:0.7 }}>{btn.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SIMON
   config: { color, numColors, intervalMs, duration }
════════════════════════════════════════════ */
const SC_ALL = [
  {bg:'#EF4444',dim:'#280C0C',name:'VERMELHO'},
  {bg:'#3B82F6',dim:'#0C1835',name:'AZUL'},
  {bg:'#22C55E',dim:'#0A2415',name:'VERDE'},
  {bg:'#EAB308',dim:'#271E04',name:'AMARELO'},
  {bg:'#F97316',dim:'#1F0D00',name:'LARANJA'},
  {bg:'#9333EA',dim:'#160A22',name:'ROXO'},
]

export function SequenceGame({ config, onComplete }) {
  const s = useScale()
  const numColors = config.numColors ?? 4
  const intervalMs = config.intervalMs ?? 680
  const SC = SC_ALL.slice(0, numColors)
  const cols = numColors <= 4 ? 2 : 3
  const btnSize = numColors <= 4 ? sp(138, s) : sp(90, s)

  const [activeBtn,setActiveBtn]=useState(null); const [phase,setPhase]=useState('showing')
  const [lives,setLives]=useState(3); const [status,setStatus]=useState('Preparando...')
  const [t,setT]=useState(config.duration); const [done,setDone]=useState(false)
  const seqR=useRef([]); const userR=useRef([]); const maxLevel=useRef(0); const livesR=useRef(3); const doneRef=useRef(false); const playRef=useRef(null)

  useEffect(() => {
    const play = (sq) => {
      setPhase('showing'); setStatus('Observe a sequência...'); userR.current=[]
      let i=0
      const next = () => {
        if (doneRef.current) return
        if (i>=sq.length) { setTimeout(() => { setActiveBtn(null); setPhase('input'); setStatus('Sua vez!') }, 350); return }
        setActiveBtn(null)
        setTimeout(() => { setActiveBtn(sq[i]); i++; setTimeout(next, intervalMs) }, Math.round(intervalMs*0.32))
      }
      setTimeout(next, 500)
    }
    playRef.current=play
    const sq=[Math.floor(Math.random()*numColors)]; seqR.current=sq; play(sq)
    const timer=setInterval(() => setT(p => { if (p<=1) { clearInterval(timer); doneRef.current=true; setDone(true); return 0 } return p-1 }), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleBtn = (idx) => {
    if (phase!=='input'||doneRef.current) return
    setActiveBtn(idx); setTimeout(() => setActiveBtn(null), 140)
    const newUser=[...userR.current,idx]; const pos=newUser.length-1
    if (newUser[pos]!==seqR.current[pos]) {
      livesR.current--; setLives(livesR.current); setStatus('Errou!')
      if (livesR.current<=0) { doneRef.current=true; setDone(true); return }
      setTimeout(() => playRef.current(seqR.current), 800); return
    }
    userR.current=newUser
    if (newUser.length===seqR.current.length) {
      maxLevel.current=Math.max(maxLevel.current,seqR.current.length)
      const ns=[...seqR.current,Math.floor(Math.random()*numColors)]; seqR.current=ns
      setStatus(`Nível ${ns.length-1} ✓`); setTimeout(() => playRef.current(ns), 650)
    }
  }

  useEffect(() => { if (!done) return; onComplete({ points:Math.min(100,maxLevel.current*13), label:`Nível ${maxLevel.current} máximo`, detail:`${3-livesR.current} vidas perdidas` }) }, [done])

  const pct=((config.duration-t)/config.duration)*100
  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:sp(16,s) }}>
      <Bar pct={pct} color={config.color} timeLeft={t} />
      <div style={{ display:'flex', gap:20, alignItems:'center' }}>
        <Num label="Nível" value={maxLevel.current} color={config.color} />
        <div style={{ display:'flex', gap:5 }}>{[0,1,2].map(i=><span key={i} style={{ fontSize:18, opacity:i<lives?1:0.15, transition:'opacity 0.3s' }}>❤️</span>)}</div>
      </div>
      <p style={{ color:phase==='input'?config.color:'#3A5470', fontSize:sp(12,s), fontFamily:'JetBrains Mono', fontWeight:phase==='input'?600:400, transition:'color 0.3s' }}>{status}</p>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols}, ${btnSize}px)`, gap:sp(10,s) }}>
        {SC.map((c,idx) => (
          <button key={idx} onClick={() => handleBtn(idx)} style={{ height:sp(numColors<=4?90:70,s), borderRadius:sp(16,s), background:activeBtn===idx?c.bg:c.dim, border:`2px solid ${activeBtn===idx?c.bg:'#182535'}`, transition:'all 0.12s', color:activeBtn===idx?'#fff':'#324050', fontSize:sp(10,s), fontWeight:700, letterSpacing:1, boxShadow:activeBtn===idx?`0 0 22px ${c.bg}50`:'none' }}>{c.name}</button>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   STROOP
   config: { color, numColors, duration }
════════════════════════════════════════════ */
const STR_ALL = [
  {word:'VERMELHO',color:'#EF4444',id:0},
  {word:'AZUL',    color:'#3B82F6',id:1},
  {word:'VERDE',   color:'#22C55E',id:2},
  {word:'AMARELO', color:'#EAB308',id:3},
  {word:'LARANJA', color:'#F97316',id:4},
  {word:'ROXO',    color:'#9333EA',id:5},
]

function newStroopTrial(n) {
  const pool = STR_ALL.slice(0, n)
  const w=Math.floor(Math.random()*n); let c; do { c=Math.floor(Math.random()*n) } while(c===w)
  return { word:pool[w].word, colorVal:pool[c].color, correct:pool[c].id }
}

export function StroopGame({ config, onComplete }) {
  const s = useScale()
  const numColors = config.numColors ?? 4
  const STR = STR_ALL.slice(0, numColors)

  const [trial,setTrial]=useState(() => newStroopTrial(numColors))
  const [correct,setCorrect]=useState(0); const [wrong,setWrong]=useState(0)
  const [t,setT]=useState(config.duration); const [done,setDone]=useState(false); const [fb,setFb]=useState(null)
  const rts=useRef([]); const cR=useRef(0); const wR=useRef(0); const tStart=useRef(Date.now()); const doneRef=useRef(false)

  useEffect(() => {
    const timer=setInterval(() => setT(p => { if (p<=1) { clearInterval(timer); doneRef.current=true; setDone(true); return 0 } return p-1 }), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAnswer = (id) => {
    if (doneRef.current) return; rts.current.push(Date.now()-tStart.current); const ok=id===trial.correct
    if (ok) { cR.current++; setCorrect(cR.current); setFb('hit') } else { wR.current++; setWrong(wR.current); setFb('miss') }
    setTimeout(() => { if (!doneRef.current) { setFb(null); setTrial(newStroopTrial(numColors)); tStart.current=Date.now() } }, 240)
  }

  useEffect(() => {
    if (!done) return
    const total=cR.current+wR.current; const acc=total>0?Math.round(cR.current/total*100):0
    const avgRT=rts.current.length?Math.round(rts.current.reduce((a,b)=>a+b,0)/rts.current.length):0
    onComplete({ points:acc, label:`${cR.current} corretos • ${acc}% precisão`, detail:`${avgRT}ms médio` })
  }, [done])

  const pct=((config.duration-t)/config.duration)*100
  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:sp(16,s) }}>
      <Bar pct={pct} color={config.color} timeLeft={t} />
      <div style={{ display:'flex', gap:24 }}><Num label="Corretos" value={correct} color={config.color} /><Num label="Erros" value={wrong} color="#EF4444" /></div>
      <p style={{ color:'#3A5470', fontSize:sp(10,s), fontFamily:'JetBrains Mono' }}>Clique na COR DA TINTA</p>
      <div style={{ padding:`${sp(20,s)}px ${sp(28,s)}px`, background:'#0C1520', borderRadius:sp(20,s), width:'100%', textAlign:'center', border:`2px solid ${fb==='hit'?'#34D399':fb==='miss'?'#EF4444':'#1A2A3A'}`, transition:'border-color 0.2s' }}>
        <span style={{ fontSize:sp(34,s), fontWeight:800, color:trial.colorVal, letterSpacing:sp(4,s) }}>{trial.word}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:sp(8,s), width:'100%' }}>
        {STR.map(item => (
          <button key={item.id} onClick={() => handleAnswer(item.id)} style={{ padding:`${sp(12,s)}px ${sp(8,s)}px`, borderRadius:sp(12,s), transition:'all 0.1s', border:`2px solid ${item.color}35`, background:`${item.color}10`, color:item.color, fontSize:sp(12,s), fontWeight:700, letterSpacing:1 }}>{item.word}</button>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   ALTERNÂNCIA — Task Switching (WCST-inspired)
   config: { color, switchEvery, numColors, numShapes, duration }
════════════════════════════════════════════ */
const TS_COLORS = [
  {id:0, name:'VERMELHO', hex:'#EF4444'},
  {id:1, name:'AZUL',     hex:'#3B82F6'},
  {id:2, name:'VERDE',    hex:'#22C55E'},
  {id:3, name:'AMARELO',  hex:'#EAB308'},
]
const TS_SHAPES = ['●','■','▲','◆']
const TS_SHAPE_NAMES = ['CÍRCULO','QUADRADO','TRIÂNGULO','LOSANGO']
const RULES = ['COR','FORMA']

export function TaskSwitchingGame({ config, onComplete }) {
  const s = useScale()
  const { switchEvery=6, numColors=3, numShapes=3, duration } = config
  const colors = TS_COLORS.slice(0, numColors)
  const shapes = TS_SHAPES.slice(0, numShapes)
  const shapeNames = TS_SHAPE_NAMES.slice(0, numShapes)

  const [rule, setRule] = useState(RULES[0])
  const [card, setCard] = useState(() => ({ c:0, sh:0 }))
  const [phase, setPhase] = useState('playing')   // playing | ruleChange
  const [fb, setFb] = useState(null)              // hit | miss | null
  const [ruleStreak, setRuleStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [total, setTotal] = useState(0)
  const [switches, setSwitches] = useState(0)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [done, setDone] = useState(false)

  const stateRef = useRef({ rule:'COR', ruleStreak:0, correct:0, total:0, switches:0, done:false })

  const nextCard = () => ({ c: Math.floor(Math.random()*numColors), sh: Math.floor(Math.random()*numShapes) })

  useEffect(() => {
    setCard(nextCard())
    const timer = setInterval(() => setTimeLeft(t => {
      if (t<=1) { clearInterval(timer); stateRef.current.done=true; setDone(true); return 0 }
      return t-1
    }), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAnswer = (id) => {
    if (stateRef.current.done || phase !== 'playing') return
    const r = stateRef.current
    const ok = rule === 'COR' ? id === card.c : id === card.sh
    r.total++; setTotal(r.total)

    if (ok) {
      r.correct++; setCorrect(r.correct); setFb('hit')
      r.ruleStreak++
      if (r.ruleStreak >= switchEvery) {
        r.ruleStreak = 0; r.switches++
        const newRule = rule === 'COR' ? 'FORMA' : 'COR'
        r.rule = newRule
        setPhase('ruleChange')
        setSwitches(r.switches)
        setTimeout(() => {
          setRule(newRule); setCard(nextCard()); setFb(null); setPhase('playing')
          setRuleStreak(0)
        }, 900)
      } else {
        setRuleStreak(r.ruleStreak)
        setTimeout(() => { setFb(null); setCard(nextCard()) }, 320)
      }
    } else {
      r.ruleStreak = Math.max(0, r.ruleStreak - 1)
      setRuleStreak(r.ruleStreak)
      setFb('miss')
      setTimeout(() => { setFb(null); setCard(nextCard()) }, 400)
    }
  }

  useEffect(() => {
    if (!done) return
    const r = stateRef.current
    const acc = r.total > 0 ? Math.round(r.correct / r.total * 100) : 0
    onComplete({ points: acc, label: `${r.correct}/${r.total} corretos • ${r.switches} trocas`, detail: `${acc}% precisão` })
  }, [done])

  const pct = ((duration - timeLeft) / duration) * 100
  const isPlaying = phase === 'playing'
  const ruleColor = rule === 'COR' ? '#22D3EE' : '#F472B6'
  const cardColor = colors[card.c]?.hex ?? '#999'
  const cardShape = shapes[card.sh]

  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:sp(12,s) }}>
      <Bar pct={pct} color={config.color} timeLeft={timeLeft} />
      <div style={{ display:'flex', gap:sp(20,s) }}>
        <Num label="Corretos" value={correct} color={config.color} />
        <Num label="Trocas" value={switches} color="#FCD34D" />
        <Num label="Total" value={total} color="#5B7A9A" />
      </div>

      {/* Rule indicator */}
      <div style={{ padding:`${sp(8,s)}px ${sp(20,s)}px`, borderRadius:sp(12,s), background:`${ruleColor}12`, border:`2px solid ${ruleColor}40`, transition:'all 0.3s', textAlign:'center' }}>
        {phase === 'ruleChange' ? (
          <div className="fade" style={{ fontSize:sp(11,s), color:'#FCD34D', fontFamily:'JetBrains Mono', fontWeight:800, letterSpacing:2 }}>⚡ REGRA MUDOU!</div>
        ) : (
          <>
            <div style={{ fontSize:sp(8,s), color:`${ruleColor}90`, fontFamily:'JetBrains Mono', letterSpacing:2, marginBottom:2 }}>CLASSIFIQUE POR</div>
            <div style={{ fontSize:sp(20,s), fontWeight:800, color:ruleColor, letterSpacing:3 }}>{rule}</div>
          </>
        )}
      </div>

      {/* Card */}
      <div style={{
        width:sp(120,s), height:sp(120,s), borderRadius:sp(22,s),
        background:'#0C1520', border:`3px solid ${fb==='hit'?'#34D399':fb==='miss'?'#EF4444':'#2A3A4A'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'border-color 0.2s',
        boxShadow: fb==='hit'?'0 0 24px #34D39930':fb==='miss'?'0 0 24px #EF444430':'none',
      }}>
        <span style={{ fontSize:sp(64,s), color:cardColor, lineHeight:1, transition:'color 0.1s' }}>{cardShape}</span>
      </div>

      {/* Progress to next switch */}
      <div style={{ width:'100%', maxWidth:240 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
          <span style={{ fontSize:8, color:'#3A5470', fontFamily:'JetBrains Mono' }}>STREAK NA REGRA</span>
          <span style={{ fontSize:8, color:ruleColor, fontFamily:'JetBrains Mono' }}>{ruleStreak}/{switchEvery}</span>
        </div>
        <div style={{ height:3, background:'#162030', borderRadius:2, overflow:'hidden' }}>
          <div style={{ width:`${(ruleStreak/switchEvery)*100}%`, height:'100%', background:ruleColor, transition:'width 0.2s' }} />
        </div>
      </div>

      {/* Response buttons — change based on rule */}
      {rule === 'COR' ? (
        <div style={{ display:'flex', gap:sp(8,s), flexWrap:'wrap', justifyContent:'center' }}>
          {colors.map((c) => (
            <button key={c.id} onClick={() => handleAnswer(c.id)} disabled={!isPlaying} style={{ width:sp(58,s), height:sp(58,s), borderRadius:sp(14,s), background:`${c.hex}20`, border:`2px solid ${c.hex}50`, transition:'all 0.12s', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:sp(28,s), height:sp(28,s), borderRadius:'50%', background:c.hex }} />
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex', gap:sp(8,s), flexWrap:'wrap', justifyContent:'center' }}>
          {shapes.map((sh, idx) => (
            <button key={idx} onClick={() => handleAnswer(idx)} disabled={!isPlaying} style={{ width:sp(58,s), height:sp(58,s), borderRadius:sp(14,s), background:'#0C1520', border:'2px solid #2A3A4A', transition:'all 0.12s', fontSize:sp(28,s), color:'#C0D0E0', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {sh}
            </button>
          ))}
        </div>
      )}
      <p style={{ fontSize:sp(9,s), color:'#3A5470', fontFamily:'JetBrains Mono', textAlign:'center' }}>
        {rule === 'COR' ? 'Clique na cor da figura' : 'Clique no formato da figura'}
      </p>
    </div>
  )
}

/* ════════════════════════════════════════════
   BOX BREATHING — cool-down, no levels
════════════════════════════════════════════ */
export function BreathingGame({ config, onComplete }) {
  const s = useScale()
  const [phase,setPhase]=useState('inhale'); const [phasePct,setPhasePct]=useState(0)
  const [cycles,setCycles]=useState(0); const [t,setT]=useState(config.duration); const [done,setDone]=useState(false)
  const elapsed=useRef(0); const cyclesR=useRef(0); const PD=4000; const CD=PD*3

  useEffect(() => {
    const interval=setInterval(() => {
      elapsed.current+=100; const pos=elapsed.current%CD; const c=Math.floor(elapsed.current/CD)
      cyclesR.current=c; setCycles(c)
      if (pos<PD) { setPhase('inhale'); setPhasePct(pos/PD) } else if (pos<PD*2) { setPhase('hold'); setPhasePct((pos-PD)/PD) } else { setPhase('exhale'); setPhasePct((pos-PD*2)/PD) }
      setT(p => { if (p<=0.1) { clearInterval(interval); setDone(true); return 0 } return +(p-0.1).toFixed(1) })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { if (!done) return; onComplete({ points:Math.min(100,cyclesR.current*16+10), label:`${cyclesR.current} ciclos completos`, detail:'Box breathing 4-4-4' }) }, [done])

  const PC={inhale:'#60A5FA',hold:'#A78BFA',exhale:'#34D399'}
  const PL={inhale:'INSPIRE',hold:'SEGURE',exhale:'EXPIRE'}
  const c=PC[phase]; const scl=phase==='inhale'?0.62+phasePct*0.58:phase==='hold'?1.2:1.2-phasePct*0.58
  const timerPct=((config.duration-t)/config.duration)*100
  const circOuter=sp(200,s); const circInner=sp(120,s)

  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:sp(18,s) }}>
      <Bar pct={timerPct} color={config.color} timeLeft={Math.round(t)} />
      <Num label="Ciclos" value={cycles} color={config.color} />
      <div style={{ position:'relative', width:circOuter, height:circOuter, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', border:`1px solid ${c}15`, pointerEvents:'none' }} />
        <div style={{ width:circInner, height:circInner, borderRadius:'50%', background:`radial-gradient(circle at 38% 32%, ${c}55, ${c}18 55%, ${c}06)`, border:`2px solid ${c}55`, transform:`scale(${scl})`, transition:'transform 0.1s linear, border-color 0.6s, background 0.6s', boxShadow:`0 0 ${Math.round(40*scl)}px ${c}22`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3 }}>
          <span style={{ fontSize:sp(10,s), fontWeight:800, color:c, letterSpacing:2 }}>{PL[phase]}</span>
          <span style={{ fontSize:sp(9,s), color:`${c}90`, fontFamily:'JetBrains Mono' }}>4 segundos</span>
        </div>
      </div>
      <div style={{ width:sp(180,s), height:3, background:'#162030', borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${phasePct*100}%`, height:'100%', background:c, transition:'width 0.1s linear, background 0.6s' }} />
      </div>
      <div style={{ display:'flex', gap:sp(20,s) }}>
        {Object.entries(PC).map(([p,col]) => (
          <div key={p} style={{ textAlign:'center', opacity:phase===p?1:0.28, transition:'opacity 0.5s' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:col, margin:'0 auto 4px' }} />
            <span style={{ fontSize:9, color:col, fontFamily:'JetBrains Mono', letterSpacing:1 }}>{PL[p]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
