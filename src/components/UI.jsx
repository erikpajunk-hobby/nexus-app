import { useState } from 'react'

export function Bar({ pct, color, timeLeft }) {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 1.5 }}>TEMPO</span>
        <span style={{ fontSize: 11, color, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{timeLeft}s</span>
      </div>
      <div style={{ height: 3, background: '#162030', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.9s linear', boxShadow: `0 0 8px ${color}90` }} />
      </div>
    </div>
  )
}

export function Num({ label, value, color, small }) {
  return (
    <div style={{ textAlign: 'center', minWidth: small ? 36 : 48 }}>
      <div style={{ fontSize: small ? 20 : 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 1, marginTop: 2 }}>{label.toUpperCase()}</div>
    </div>
  )
}

export function Shell({ ex, exIdx, exercises, onQuit, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#07090F', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px 40px' }}>
      <div style={{ width: '100%', maxWidth: 360, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <button onClick={onQuit} style={{ background: 'none', border: 'none', color: '#3A5470', fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: 1, padding: 0 }}>← SAIR</button>
          <div style={{ display: 'flex', gap: 5 }}>
            {exercises.map((e, i) => (
              <div key={e.id} style={{ width: 6, height: 6, borderRadius: '50%', background: i === exIdx ? e.color : i < exIdx ? '#2A4060' : '#162030', transition: 'background 0.4s' }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#E8F0FF' }}>{ex.name}</div>
        <div style={{ fontSize: 9, color: ex.color, fontFamily: 'JetBrains Mono', marginTop: 2, letterSpacing: 1.5 }}>{ex.subtitle.toUpperCase()}</div>
      </div>
      <div style={{ width: '100%', maxWidth: 360 }}>{children}</div>
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: '#07090F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #22D3EE', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: '#3A5470', letterSpacing: 3 }}>NEXUS</span>
    </div>
  )
}

export function PageWrap({ children, center }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#07090F',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: center ? 'center' : 'flex-start',
      padding: '28px 20px 48px', overflowY: 'auto',
    }}>
      {children}
    </div>
  )
}

export function Card({ children, accent, style = {} }) {
  return (
    <div style={{
      background: '#0A1520', borderRadius: 18,
      border: `1px solid ${accent ? accent + '25' : '#1A2A3A'}`,
      padding: '16px 18px', ...style,
    }}>
      {children}
    </div>
  )
}

export function Label({ children, style = {} }) {
  return (
    <div style={{ fontSize: 8, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 2, ...style }}>
      {children}
    </div>
  )
}

export function BackBtn({ onClick, label = '← VOLTAR' }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#3A5470', fontSize: 11, fontFamily: 'JetBrains Mono', letterSpacing: 1, padding: 0, marginBottom: 24 }}>
      {label}
    </button>
  )
}

/* Sparkline — tiny SVG line chart */
export function Sparkline({ data, color, width = 200, height = 40 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 6) - 3
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * (height - 6) - 3
        return <circle key={i} cx={x} cy={y} r={i === data.length - 1 ? 3 : 0} fill={color} />
      })}
    </svg>
  )
}

/* PinPad */
export function PinPad({ onComplete, title, subtitle, color = '#22D3EE' }) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const press = (d) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => { onComplete(next); setPin(''); }, 120)
    }
  }
  const del = () => setPin(p => p.slice(0, -1))

  return (
    <div className="fade" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {title && <div style={{ fontSize: 18, fontWeight: 800, color: '#E8F0FF', textAlign: 'center' }}>{title}</div>}
      {subtitle && <div style={{ fontSize: 11, color: '#5B7A9A', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>{subtitle}</div>}
      {/* Dots */}
      <div style={{ display: 'flex', gap: 14 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < pin.length ? color : '#1A2A3A', transition: 'background 0.15s', boxShadow: i < pin.length ? `0 0 8px ${color}` : 'none' }} />
        ))}
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 10 }}>
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((d, i) => (
          <button key={i} onClick={() => d === '⌫' ? del() : d !== '' ? press(String(d)) : null}
            style={{
              height: 64, borderRadius: 16,
              background: d === '' ? 'transparent' : '#0C1520',
              border: d === '' ? 'none' : '1px solid #1A2A3A',
              color: d === '⌫' ? '#5B7A9A' : '#E8F0FF',
              fontSize: d === '⌫' ? 18 : 22, fontWeight: 700,
              cursor: d === '' ? 'default' : 'pointer',
              transition: 'all 0.1s',
            }}
          >{d}</button>
        ))}
      </div>
    </div>
  )
}
