import { useState, useEffect } from 'react'
import { getProfiles, createProfile, verifyPin, deleteProfile } from '../lib/db.js'
import { AVATAR_COLORS } from '../constants.js'
import { Spinner, PageWrap, PinPad } from '../components/UI.jsx'

export default function ProfileSelect({ onLogin }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [view, setView] = useState('list') // list | pin | create
  const [selected, setSelected] = useState(null)
  const [pinError, setPinError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPin, setNewPin] = useState('')
  const [newPinConfirm, setNewPinConfirm] = useState('')
  const [createStep, setCreateStep] = useState('name') // name | pin | confirm
  const [chosenColor, setChosenColor] = useState(AVATAR_COLORS[0])

  useEffect(() => { load() }, [])

  const load = async () => {
    try { const data = await getProfiles(); setProfiles(data) }
    catch (e) { setError('Erro ao conectar com o banco. Verifique as variáveis de ambiente.') }
    finally { setLoading(false) }
  }

  const handleSelect = (p) => { setSelected(p); setPinError(false); setView('pin') }

  const handlePin = async (pin) => {
    const ok = await verifyPin(selected.id, pin)
    if (ok) { onLogin(selected) }
    else { setPinError(true); setTimeout(() => setPinError(false), 1200) }
  }

  const handleDelete = async (e, p) => {
    e.stopPropagation()
    if (!confirm(`Deletar perfil "${p.name}" e todo o histórico?`)) return
    await deleteProfile(p.id)
    setProfiles(prev => prev.filter(x => x.id !== p.id))
  }

  const handleCreateName = () => {
    if (!newName.trim()) return
    if (profiles.find(p => p.name.toLowerCase() === newName.trim().toLowerCase())) {
      setError('Já existe um perfil com esse nome.'); return
    }
    setError(null); setCreateStep('pin')
  }

  const handleCreatePin = (pin) => { setNewPin(pin); setCreateStep('confirm') }

  const handleCreateConfirm = async (pin) => {
    if (pin !== newPin) { setError('PINs diferentes. Tente de novo.'); setCreateStep('pin'); setNewPin(''); return }
    setCreating(true)
    try {
      const profile = await createProfile(newName.trim(), pin, chosenColor)
      setProfiles(prev => [...prev, profile])
      onLogin(profile)
    } catch(e) {
      setError('Erro ao criar perfil.'); setCreating(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <PageWrap center>
      <div className="fade" style={{ width: '100%', maxWidth: 340 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 4, marginBottom: 10 }}>NEXUS</div>
          {view === 'list' && <>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#E8F0FF', lineHeight: 1.1 }}>Quem está<br />treinando?</div>
          </>}
          {view === 'pin' && <div style={{ fontSize: 24, fontWeight: 800, color: '#E8F0FF' }}>Olá, {selected?.name} 👋</div>}
          {view === 'create' && <div style={{ fontSize: 24, fontWeight: 800, color: '#E8F0FF' }}>Novo Perfil</div>}
        </div>

        {error && (
          <div style={{ background: '#1A0808', border: '1px solid #EF4444', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#EF4444', fontFamily: 'JetBrains Mono', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* PROFILE LIST */}
        {view === 'list' && <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {profiles.map((p, i) => (
              <button key={p.id} onClick={() => handleSelect(p)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, background: '#0C1520', border: `1px solid ${p.avatar_color}20`, textAlign: 'left', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = p.avatar_color + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = p.avatar_color + '20'}
              >
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${p.avatar_color}18`, border: `2px solid ${p.avatar_color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: p.avatar_color, flexShrink: 0 }}>
                  {p.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FF' }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', marginTop: 2 }}>toque para entrar</div>
                </div>
                <button onClick={(e) => handleDelete(e, p)} style={{ background: 'none', border: 'none', color: '#2A3A4A', fontSize: 14, padding: '4px 6px', borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#2A3A4A'}
                >✕</button>
              </button>
            ))}
          </div>

          <button onClick={() => { setView('create'); setCreateStep('name'); setNewName(''); setNewPin(''); setError(null) }} style={{ width: '100%', padding: '15px', borderRadius: 16, background: 'none', border: '2px dashed #1A2A3A', color: '#3A5470', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#22D3EE50'; e.currentTarget.style.color = '#22D3EE' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2A3A'; e.currentTarget.style.color = '#3A5470' }}
          >+ NOVO PERFIL</button>
        </>}

        {/* PIN ENTRY */}
        {view === 'pin' && <>
          <PinPad
            title={null}
            subtitle={pinError ? '❌ PIN incorreto. Tente de novo.' : 'Digite seu PIN de 4 dígitos'}
            color={selected?.avatar_color}
            onComplete={handlePin}
          />
          <button onClick={() => { setView('list'); setSelected(null) }} style={{ marginTop: 20, width: '100%', padding: '13px', borderRadius: 13, background: 'none', border: '1px solid #1A2A3A', color: '#5B7A9A', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>
            ← VOLTAR
          </button>
        </>}

        {/* CREATE PROFILE */}
        {view === 'create' && <>
          {createStep === 'name' && (
            <div className="slide">
              {/* Color picker */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, color: '#3A5470', fontFamily: 'JetBrains Mono', letterSpacing: 2, marginBottom: 10 }}>COR DO AVATAR</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {AVATAR_COLORS.map(c => (
                    <button key={c} onClick={() => setChosenColor(c)} style={{ width: 36, height: 36, borderRadius: 10, background: `${c}20`, border: `2px solid ${chosenColor === c ? c : c + '30'}`, boxShadow: chosenColor === c ? `0 0 12px ${c}` : 'none', transition: 'all 0.15s' }} />
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, padding: '14px 16px', background: '#0C1520', borderRadius: 14, border: `1px solid ${chosenColor}25` }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: `${chosenColor}18`, border: `2px solid ${chosenColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: chosenColor, flexShrink: 0 }}>
                  {newName ? newName[0].toUpperCase() : '?'}
                </div>
                <input
                  value={newName} onChange={e => setNewName(e.target.value)} placeholder="Seu nome..."
                  onKeyDown={e => e.key === 'Enter' && handleCreateName()}
                  autoFocus
                  style={{ flex: 1, background: 'none', border: 'none', color: '#E8F0FF', fontSize: 16, fontWeight: 700 }}
                />
              </div>
              <button onClick={handleCreateName} style={{ width: '100%', padding: '15px', borderRadius: 14, background: newName.trim() ? 'linear-gradient(135deg, #22D3EE, #3B82F6)' : '#162030', border: 'none', color: newName.trim() ? '#070B14' : '#3A5470', fontSize: 14, fontWeight: 800, letterSpacing: 2, transition: 'all 0.2s' }}>
                CONTINUAR →
              </button>
            </div>
          )}

          {createStep === 'pin' && (
            <div className="slide">
              <PinPad title="Crie seu PIN" subtitle="4 dígitos para proteger seu perfil" color={chosenColor} onComplete={handleCreatePin} />
            </div>
          )}

          {createStep === 'confirm' && (
            <div className="slide">
              <PinPad title="Confirme o PIN" subtitle="Digite o mesmo PIN de novo" color={chosenColor} onComplete={handleCreateConfirm} />
            </div>
          )}

          <button onClick={() => { setView('list'); setError(null) }} style={{ marginTop: 16, width: '100%', padding: '13px', borderRadius: 13, background: 'none', border: '1px solid #1A2A3A', color: '#5B7A9A', fontSize: 12, fontWeight: 700, letterSpacing: 1.5 }}>
            ← CANCELAR
          </button>

          {creating && <div style={{ textAlign: 'center', marginTop: 12, color: '#3A5470', fontSize: 11, fontFamily: 'JetBrains Mono' }}>Criando perfil...</div>}
        </>}

      </div>
    </PageWrap>
  )
}
