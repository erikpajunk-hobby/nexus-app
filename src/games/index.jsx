import { useState, useEffect, useRef } from 'react'
import { Bar, Num } from '../components/UI.jsx'

/* ════════════════════════════════════════════
   CAMPO VISUAL (UFOV-inspired)
════════════════════════════════════════════ */
const SYMBOLS = ['●', '■', '▲', '◆']
const N_POS = 8
const getCoords = (idx, r) => {
  const a = (idx / N_POS) * 2 * Math.PI - Math.PI / 2
  return { x: Math.cos(a) * r, y: Math.sin(a) * r }
}

export function UFOVGame({ config, onComplete }) {
  const [phase, setPhase] = useState('fixation')
  const [cStim, setCStim] = useState(null); const [pStim, setPStim] = useState(null)
  const [cAns, setCAns] = useState(null); const [pAns, setPAns] = useState(null)
  const [correct, setCorrect] = useState(0); const [total, setTotal] = useState(0)
  const [displayMs, setDisplayMs] = useState(600); const [radius, setRadius] = useState(82)
  const [fb, setFb] = useState(null); const [timeLeft, setTimeLeft] = useState(config.duration); const [done, setDone] = useState(false)
  const R = useRef({ correct:0, total:0, displayMs:600, radius:82, stim:{c:0,p:0}, cAns:null, pAns:null, awaiting:false, done:false })
  const respTimer = useRef(null); const trialTimer = useRef(null)
  const evalRef = useRef(null); const runRef = useRef(null)

  useEffect(() => {
    const r = R.current
    const evaluate = () => {
      if (!r.awaiting) return; r.awaiting = false; clearTimeout(respTimer.current)
      const ok = r.cAns === r.stim.c && r.pAns === r.stim.p
      r.total++; setTotal(r.total)
      if (ok) { r.correct++; setCorrect(r.correct); if (r.correct % 3 === 0) { r.displayMs = Math.max(160, r.displayMs-55); setDisplayMs(r.displayMs); r.radius = Math.min(128, r.radius+10); setRadius(r.radius) } }
      setFb(ok ? 'hit' : 'miss'); setPhase('feedback')
      trialTimer.current = setTimeout(() => runRef.current(), 380)
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
          respTimer.current = setTimeout(() => { if (r.awaiting) evaluate() }, 2600)
        }, r.displayMs)
      }, 340)
    }
    runRef.current = runTrial
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t<=1) { clearInterval(timer); r.done=true; clearTimeout(respTimer.current); clearTimeout(trialTimer.current); setDone(true); return 0 } return t-1 })
    }, 1000)
    runTrial()
    return () => { clearInterval(timer); clearTimeout(respTimer.current); clearTimeout(trialTimer.current); r.done=true }
  }, [])

  const handleC = (idx) => { const r=R.current; if (!r.awaiting) return; r.cAns=idx; setCAns(idx); if (r.pAns!==null) evalRef.current() }
  const handleP = (idx) => { const r=R.current; if (!r.awaiting) return; r.pAns=idx; setPAns(idx); if (r.cAns!==null) evalRef.current() }

  useEffect(() => {
    if (!done) return
    const r = R.current; const acc = r.total>0 ? Math.round(r.correct/r.total*100) : 0
    onComplete({ points: acc, label: `${r.correct}/${r.total} corretos • flash ${r.displayMs}ms`, detail: `Campo: raio ${r.radius}px` })
  }, [done])

  const pct = ((config.duration - timeLeft) / config.duration) * 100
  const isResp = phase === 'response'; const CX=130, CY=130
  const hint = phase==='fixation' ? 'Foque no +' : phase==='display' ? '👁 OBSERVE!' : phase==='response' ? 'Clique símbolo + posição' : fb==='hit' ? '✓' : '✗'

  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <Bar pct={pct} color={config.color} timeLeft={timeLeft} />
      <div style={{ display:'flex', gap:16, alignItems:'flex-end' }}>
        <Num label="Corretos" value={correct} color={config.color} />
        <Num label="Total" value={total} color="#5B7A9A" />
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:18, fontWeight:800, color:'#FCD34D', lineHeight:1 }}>{displayMs}</div>
          <div style={{ fontSize:7, color:'#3A5470', fontFamily:'JetBrains Mono', letterSpacing:1 }}>FLASH MS</div>
        </div>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {SYMBOLS.map((sym, idx) => (
          <button key={idx} onClick={() => handleC(idx)} style={{ width:54, height:54, borderRadius:13, background: cAns===idx ? `${config.color}30` : phase==='display'&&cStim===idx ? `${config.color}18` : '#0C1520', border:`2px solid ${cAns===idx ? config.color : phase==='display'&&cStim===idx ? config.color : '#1A2A3A'}`, color: cAns===idx ? config.color : isResp ? '#708090' : '#2A3A4A', fontSize:22, transition:'all 0.12s' }}>{sym}</button>
        ))}
      </div>
      <div style={{ position:'relative', width:260, height:260 }}>
        <div style={{ position:'absolute', width:radius*2+40, height:radius*2+40, borderRadius:'50%', border:`1px solid ${config.color}14`, left:CX-radius-20, top:CY-radius-20, pointerEvents:'none', transition:'all 0.6s' }} />
        {Array(N_POS).fill(null).map((_, idx) => {
          const { x, y } = getCoords(idx, radius); const isActive=phase==='display'&&pStim===idx; const isSel=pAns===idx
          return <button key={idx} onClick={() => handleP(idx)} style={{ position:'absolute', left:CX+x-18, top:CY+y-18, width:36, height:36, borderRadius:'50%', background:isActive?config.color:isSel?`${config.color}30`:'#0C1520', border:`2px solid ${isActive||isSel?config.color:'#1A2A3A'}`, boxShadow:isActive?`0 0 20px ${config.color}`:'none', transition:'all 0.08s' }} />
        })}
        <div style={{ position:'absolute', left:CX-26, top:CY-26, width:52, height:52, borderRadius:13, background:phase==='display'?`${config.color}20`:'#0C1520', border:`2px solid ${phase==='display'?config.color:'#1A2A3A'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.1s', userSelect:'none' }}>
          <span style={{ fontSize:22, color:config.color, fontWeight:800 }}>{phase==='display'&&cStim!==null?SYMBOLS[cStim]:phase==='response'?'?':'+'}</span>
        </div>
      </div>
      <p style={{ color:phase==='response'?config.color:'#3A5470', fontSize:10, fontFamily:'JetBrains Mono', textAlign:'center', transition:'color 0.3s' }}>{hint}</p>
    </div>
  )
}

/* ════════════════════════════════════════════
   DUAL N-BACK
════════════════════════════════════════════ */
const NBACK_LETTERS = ['A','B','C','D','E','F','G','H']
const N = 2

export function DualNBackGame({ config, onComplete }) {
  const [activeCell, setActiveCell] = useState(null); const [activeLetter, setActiveLetter] = useState(null)
  const [posHits, setPosHits] = useState(0); const [letHits, setLetHits] = useState(0)
  const [posMisses, setPosMisses] = useState(0); const [letMisses, setLetMisses] = useState(0)
  const [posFa, setPosFa] = useState(0); const [letFa, setLetFa] = useState(0)
  const [posFb, setPosFb] = useState(null); const [letFb, setLetFb] = useState(null)
  const [timeLeft, setTimeLeft] = useState(config.duration); const [done, setDone] = useState(false); const [stepCount, setStepCount] = useState(0)
  const posSeq=useRef([]); const letSeq=useRef([])
  const posRsp=useRef(false); const letRsp=useRef(false)
  const prevPosMtch=useRef(false); const prevLetMtch=useRef(false)
  const pH=useRef(0); const lH=useRef(0); const pM=useRef(0); const lM=useRef(0); const pF=useRef(0); const lF=useRef(0)
  const doneRef=useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => { if (t<=1) { clearInterval(timer); clearInterval(stepper); doneRef.current=true; setDone(true); return 0 } return t-1 })
    }, 1000)
    const stepper = setInterval(() => {
      if (doneRef.current) return
      if (prevPosMtch.current && !posRsp.current) { pM.current++; setPosMisses(pM.current) }
      if (prevLetMtch.current && !letRsp.current) { lM.current++; setLetMisses(lM.current) }
      const newPos=Math.floor(Math.random()*9); const newLetIdx=Math.floor(Math.random()*8)
      posSeq.current.push(newPos); letSeq.current.push(newLetIdx)
      const idx=posSeq.current.length-1
      posRsp.current=false; letRsp.current=false
      prevPosMtch.current=idx>=N&&posSeq.current[idx]===posSeq.current[idx-N]
      prevLetMtch.current=idx>=N&&letSeq.current[idx]===letSeq.current[idx-N]
      setActiveCell(newPos); setActiveLetter(NBACK_LETTERS[newLetIdx]); setStepCount(idx+1)
      setTimeout(() => { if (!doneRef.current) { setActiveCell(null); setActiveLetter(null) } }, 1500)
    }, 2000)
    return () => { clearInterval(timer); clearInterval(stepper) }
  }, [])

  const handlePosMatch = () => {
    if (doneRef.current||posRsp.current) return; posRsp.current=true
    const idx=posSeq.current.length-1; const isMatch=idx>=N&&posSeq.current[idx]===posSeq.current[idx-N]
    if (isMatch) { pH.current++; setPosHits(pH.current); setPosFb('hit') } else { pF.current++; setPosFa(pF.current); setPosFb('miss') }
    setTimeout(() => setPosFb(null), 500)
  }
  const handleLetMatch = () => {
    if (doneRef.current||letRsp.current) return; letRsp.current=true
    const idx=letSeq.current.length-1; const isMatch=idx>=N&&letSeq.current[idx]===letSeq.current[idx-N]
    if (isMatch) { lH.current++; setLetHits(lH.current); setLetFb('hit') } else { lF.current++; setLetFa(lF.current); setLetFb('miss') }
    setTimeout(() => setLetFb(null), 500)
  }

  useEffect(() => {
    if (!done) return
    const posTotal=pH.current+pM.current; const letTotal=lH.current+lM.current
    const posPts=posTotal>0?Math.max(0,(pH.current-pF.current*0.5)/posTotal*100):0
    const letPts=letTotal>0?Math.max(0,(lH.current-lF.current*0.5)/letTotal*100):0
    onComplete({ points:Math.min(100,Math.round((posPts+letPts)/2)), label:`Pos ${pH.current}✓${pM.current}✗ • Let ${lH.current}✓${lM.current}✗`, detail:`Falsos: pos ${pF.current} • let ${lF.current}` })
  }, [done])

  const pct = ((config.duration-timeLeft)/config.duration)*100
  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
      <Bar pct={pct} color={config.color} timeLeft={timeLeft} />
      <div style={{ display:'flex', gap:6, padding:'8px 12px', background:'#0C1520', borderRadius:12, border:'1px solid #1A2A3A' }}>
        <div style={{ paddingRight:10, borderRight:'1px solid #1A2A3A' }}>
          <div style={{ fontSize:8, color:config.color, fontFamily:'JetBrains Mono', letterSpacing:1.5, marginBottom:4 }}>POSIÇÃO</div>
          <div style={{ display:'flex', gap:8 }}><Num label="Hit" value={posHits} color={config.color} small /><Num label="Miss" value={posMisses} color="#EF4444" small /><Num label="FA" value={posFa} color="#F59E0B" small /></div>
        </div>
        <div style={{ paddingLeft:10 }}>
          <div style={{ fontSize:8, color:'#F59E0B', fontFamily:'JetBrains Mono', letterSpacing:1.5, marginBottom:4 }}>LETRA</div>
          <div style={{ display:'flex', gap:8 }}><Num label="Hit" value={letHits} color="#F59E0B" small /><Num label="Miss" value={letMisses} color="#EF4444" small /><Num label="FA" value={letFa} color="#F59E0B" small /></div>
        </div>
      </div>
      <div style={{ width:80, height:56, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:activeLetter?`${config.color}15`:'#0C1520', border:`2px solid ${activeLetter?config.color:'#1A2A3A'}`, transition:'all 0.18s' }}>
        <span style={{ fontSize:30, fontWeight:800, color:activeLetter?config.color:'#1A2A3A' }}>{activeLetter||'—'}</span>
      </div>
      <p style={{ color:'#3A5470', fontSize:9, fontFamily:'JetBrains Mono' }}>Rodada {stepCount} • compare com {N} passos atrás</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 66px)', gap:7 }}>
        {Array(9).fill(null).map((_, i) => (
          <div key={i} style={{ height:66, borderRadius:12, background:activeCell===i?`${config.color}20`:'#0C1520', border:`2px solid ${activeCell===i?config.color:'#1A2A3A'}`, boxShadow:activeCell===i?`0 0 14px ${config.color}28`:'none', transition:'all 0.18s' }} />
        ))}
      </div>
      <div style={{ display:'flex', gap:10 }}>
        {[{label:'MATCH',sub:'POSIÇÃO',fb:posFb,color:config.color,onClick:handlePosMatch},{label:'MATCH',sub:'LETRA',fb:letFb,color:'#F59E0B',onClick:handleLetMatch}].map(btn => (
          <button key={btn.sub} onClick={btn.onClick} style={{ padding:'11px 20px', borderRadius:12, transition:'all 0.15s', background:btn.fb==='hit'?'#34D39918':btn.fb==='miss'?'#EF444418':`${btn.color}10`, border:`2px solid ${btn.fb==='hit'?'#34D399':btn.fb==='miss'?'#EF4444':btn.color}50`, color:btn.fb==='hit'?'#34D399':btn.fb==='miss'?'#EF4444':btn.color, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <span style={{ fontSize:12, fontWeight:800, letterSpacing:2 }}>{btn.fb==='hit'?'✓':btn.fb==='miss'?'✗':btn.label}</span>
            <span style={{ fontSize:8, fontFamily:'JetBrains Mono', letterSpacing:1.5, opacity:0.7 }}>{btn.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   SIMON
════════════════════════════════════════════ */
const SC = [{bg:'#EF4444',dim:'#280C0C',name:'VERMELHO'},{bg:'#3B82F6',dim:'#0C1835',name:'AZUL'},{bg:'#22C55E',dim:'#0A2415',name:'VERDE'},{bg:'#EAB308',dim:'#271E04',name:'AMARELO'}]

export function SequenceGame({ config, onComplete }) {
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
        setActiveBtn(null); setTimeout(() => { setActiveBtn(sq[i]); i++; setTimeout(next, 680) }, 220)
      }
      setTimeout(next, 500)
    }
    playRef.current=play
    const s=[Math.floor(Math.random()*4)]; seqR.current=s; play(s)
    const timer=setInterval(() => { setT(prev => { if (prev<=1) { clearInterval(timer); doneRef.current=true; setDone(true); return 0 } return prev-1 }) }, 1000)
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
      const ns=[...seqR.current,Math.floor(Math.random()*4)]; seqR.current=ns
      setStatus(`Nível ${ns.length-1} ✓`); setTimeout(() => playRef.current(ns), 650)
    }
  }

  useEffect(() => { if (!done) return; onComplete({ points:Math.min(100,maxLevel.current*13), label:`Nível ${maxLevel.current} máximo`, detail:`${3-livesR.current} vidas perdidas` }) }, [done])

  const pct=((config.duration-t)/config.duration)*100
  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      <Bar pct={pct} color={config.color} timeLeft={t} />
      <div style={{ display:'flex', gap:20, alignItems:'center' }}>
        <Num label="Nível" value={maxLevel.current} color={config.color} />
        <div style={{ display:'flex', gap:5 }}>{[0,1,2].map(i => <span key={i} style={{ fontSize:18, opacity:i<lives?1:0.15, transition:'opacity 0.3s' }}>❤️</span>)}</div>
      </div>
      <p style={{ color:phase==='input'?config.color:'#3A5470', fontSize:12, fontFamily:'JetBrains Mono', fontWeight:phase==='input'?600:400, transition:'color 0.3s' }}>{status}</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 138px)', gap:10 }}>
        {SC.map((c,idx) => (
          <button key={idx} onClick={() => handleBtn(idx)} style={{ height:90, borderRadius:16, background:activeBtn===idx?c.bg:c.dim, border:`2px solid ${activeBtn===idx?c.bg:'#182535'}`, transition:'all 0.12s', color:activeBtn===idx?'#fff':'#324050', fontSize:10, fontWeight:700, letterSpacing:1, boxShadow:activeBtn===idx?`0 0 22px ${c.bg}50`:'none' }}>{c.name}</button>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   STROOP
════════════════════════════════════════════ */
const STR=[{word:'VERMELHO',color:'#EF4444',id:0},{word:'AZUL',color:'#3B82F6',id:1},{word:'VERDE',color:'#22C55E',id:2},{word:'AMARELO',color:'#EAB308',id:3}]
function newTrial() { const w=Math.floor(Math.random()*STR.length); let c; do { c=Math.floor(Math.random()*STR.length) } while(c===w); return { word:STR[w].word, colorVal:STR[c].color, correct:STR[c].id } }

export function StroopGame({ config, onComplete }) {
  const [trial,setTrial]=useState(() => newTrial()); const [correct,setCorrect]=useState(0); const [wrong,setWrong]=useState(0)
  const [t,setT]=useState(config.duration); const [done,setDone]=useState(false); const [fb,setFb]=useState(null)
  const rts=useRef([]); const cR=useRef(0); const wR=useRef(0); const tStart=useRef(Date.now()); const doneRef=useRef(false)

  useEffect(() => {
    const timer=setInterval(() => { setT(prev => { if (prev<=1) { clearInterval(timer); doneRef.current=true; setDone(true); return 0 } return prev-1 }) }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAnswer = (id) => {
    if (doneRef.current) return; rts.current.push(Date.now()-tStart.current); const ok=id===trial.correct
    if (ok) { cR.current++; setCorrect(cR.current); setFb('hit') } else { wR.current++; setWrong(wR.current); setFb('miss') }
    setTimeout(() => { if (!doneRef.current) { setFb(null); setTrial(newTrial()); tStart.current=Date.now() } }, 240)
  }

  useEffect(() => {
    if (!done) return
    const total=cR.current+wR.current; const acc=total>0?Math.round(cR.current/total*100):0
    const avgRT=rts.current.length?Math.round(rts.current.reduce((a,b)=>a+b,0)/rts.current.length):0
    onComplete({ points:acc, label:`${cR.current} corretos • ${acc}% precisão`, detail:`${avgRT}ms médio` })
  }, [done])

  const pct=((config.duration-t)/config.duration)*100
  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
      <Bar pct={pct} color={config.color} timeLeft={t} />
      <div style={{ display:'flex', gap:24 }}><Num label="Corretos" value={correct} color={config.color} /><Num label="Erros" value={wrong} color="#EF4444" /></div>
      <p style={{ color:'#3A5470', fontSize:10, fontFamily:'JetBrains Mono' }}>Clique na COR DA TINTA</p>
      <div style={{ padding:'22px 44px', background:'#0C1520', borderRadius:20, minWidth:270, textAlign:'center', border:`2px solid ${fb==='hit'?'#34D399':fb==='miss'?'#EF4444':'#1A2A3A'}`, transition:'border-color 0.2s' }}>
        <span style={{ fontSize:36, fontWeight:800, color:trial.colorVal, letterSpacing:4 }}>{trial.word}</span>
      </div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
        {STR.map(item => (
          <button key={item.id} onClick={() => handleAnswer(item.id)} style={{ padding:'12px 18px', borderRadius:12, transition:'all 0.1s', border:`2px solid ${item.color}35`, background:`${item.color}10`, color:item.color, fontSize:12, fontWeight:700, letterSpacing:1, minWidth:110 }}>{item.word}</button>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════
   BOX BREATHING
════════════════════════════════════════════ */
export function BreathingGame({ config, onComplete }) {
  const [phase,setPhase]=useState('inhale'); const [phasePct,setPhasePct]=useState(0)
  const [cycles,setCycles]=useState(0); const [t,setT]=useState(config.duration); const [done,setDone]=useState(false)
  const elapsed=useRef(0); const cyclesR=useRef(0); const PD=4000; const CD=PD*3

  useEffect(() => {
    const interval=setInterval(() => {
      elapsed.current+=100; const pos=elapsed.current%CD; const c=Math.floor(elapsed.current/CD)
      cyclesR.current=c; setCycles(c)
      if (pos<PD) { setPhase('inhale'); setPhasePct(pos/PD) } else if (pos<PD*2) { setPhase('hold'); setPhasePct((pos-PD)/PD) } else { setPhase('exhale'); setPhasePct((pos-PD*2)/PD) }
      setT(prev => { if (prev<=0.1) { clearInterval(interval); setDone(true); return 0 } return +(prev-0.1).toFixed(1) })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { if (!done) return; onComplete({ points:Math.min(100,cyclesR.current*16+10), label:`${cyclesR.current} ciclos completos`, detail:'Box breathing 4-4-4' }) }, [done])

  const PC={inhale:'#60A5FA',hold:'#A78BFA',exhale:'#34D399'}
  const PL={inhale:'INSPIRE',hold:'SEGURE',exhale:'EXPIRE'}
  const c=PC[phase]; const scale=phase==='inhale'?0.62+phasePct*0.58:phase==='hold'?1.2:1.2-phasePct*0.58
  const timerPct=((config.duration-t)/config.duration)*100

  return (
    <div className="fade" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
      <Bar pct={timerPct} color={config.color} timeLeft={Math.round(t)} />
      <Num label="Ciclos" value={cycles} color={config.color} />
      <div style={{ position:'relative', width:220, height:220, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ position:'absolute', width:'100%', height:'100%', borderRadius:'50%', border:`1px solid ${c}15`, pointerEvents:'none' }} />
        <div style={{ width:130, height:130, borderRadius:'50%', background:`radial-gradient(circle at 38% 32%, ${c}55, ${c}18 55%, ${c}06)`, border:`2px solid ${c}55`, transform:`scale(${scale})`, transition:'transform 0.1s linear, border-color 0.6s, background 0.6s', boxShadow:`0 0 ${Math.round(40*scale)}px ${c}22`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3 }}>
          <span style={{ fontSize:10, fontWeight:800, color:c, letterSpacing:2 }}>{PL[phase]}</span>
          <span style={{ fontSize:9, color:`${c}90`, fontFamily:'JetBrains Mono' }}>4 segundos</span>
        </div>
      </div>
      <div style={{ width:200, height:3, background:'#162030', borderRadius:2, overflow:'hidden' }}>
        <div style={{ width:`${phasePct*100}%`, height:'100%', background:c, transition:'width 0.1s linear, background 0.6s' }} />
      </div>
      <div style={{ display:'flex', gap:22 }}>
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
