import { useState, useEffect, useCallback } from 'react'
import { EXERCISES, BREATHING } from './constants.js'
import { getAllSessions, saveSession, getLevels, saveLevel } from './lib/db.js'
import { Spinner } from './components/UI.jsx'
import ProfileSelect from './screens/ProfileSelect.jsx'
import Home from './screens/Home.jsx'
import Performance from './screens/Performance.jsx'
import Compare from './screens/Compare.jsx'
import History from './screens/History.jsx'
import HowToPlay from './screens/HowToPlay.jsx'
import Session from './screens/Session.jsx'

export default function App() {
  const [screen, setScreen] = useState('profiles')
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [levels, setLevels] = useState({})   // { exerciseId: { journey, unlocked } }
  const [loading, setLoading] = useState(false)

  // Session state
  const [exIndices, setExIndices] = useState([])
  const [isSingle, setIsSingle] = useState(false)

  const loadData = useCallback(async (p) => {
    setLoading(true)
    try {
      const [data, lvls] = await Promise.all([getAllSessions(p.id), getLevels(p.id)])
      setSessions(data); setLevels(lvls)
    } catch (e) {
      console.error('loadData error', e)
      setSessions([]); setLevels({})
    } finally { setLoading(false) }
  }, [])

  const handleLogin = async (p) => {
    setProfile(p); await loadData(p); setScreen('home')
  }

  const handleStartFull = () => {
    setExIndices(EXERCISES.map((_, i) => i)); setIsSingle(false); setScreen('session')
  }

  const handleStartSingle = (idx) => {
    setExIndices([idx]); setIsSingle(true); setScreen('session')
  }

  const handleBreathing = () => {
    setExIndices(['breathing']); setIsSingle(true); setScreen('session')
  }

  const handleSessionComplete = async (scores, single) => {
    try {
      await saveSession(profile.id, scores, !single)
      await loadData(profile)
    } catch (e) { console.error('saveSession error', e) }
  }

  const handleLevelUp = async (exerciseId, newJourney, newUnlocked) => {
    // Update local state immediately
    setLevels(prev => ({
      ...prev,
      [exerciseId]: { journey: newJourney, unlocked: newUnlocked }
    }))
    // Persist to DB
    await saveLevel(profile.id, exerciseId, newJourney, newUnlocked)
  }

  const handleSwitchProfile = () => {
    setProfile(null); setSessions(null); setLevels({}); setScreen('profiles')
  }

  // Compute streak for profile
  const streak = (() => {
    if (!sessions?.length) return 0
    const full = sessions.filter(s => s.is_full_session)
    if (!full.length) return 0
    const dates = [...new Set(full.map(s => new Date(s.created_at).toDateString()))].map(d => new Date(d)).sort((a,b)=>b-a)
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

  if (screen === 'profiles') return <ProfileSelect onLogin={handleLogin} />
  if (loading || !sessions) return <Spinner />

  if (screen === 'session') return (
    <Session
      profile={{ ...profile, currentStreak: streak }}
      exIndices={exIndices}
      isSingle={isSingle}
      levels={levels}
      onLevelUp={handleLevelUp}
      onComplete={handleSessionComplete}
      onQuit={() => { loadData(profile); setScreen('home') }}
    />
  )

  if (screen === 'home') return (
    <Home
      profile={profile}
      sessions={sessions}
      levels={levels}
      onStartFull={handleStartFull}
      onStartSingle={handleStartSingle}
      onBreathing={handleBreathing}
      onPerformance={() => setScreen('performance')}
      onHistory={() => setScreen('history')}
      onCompare={() => setScreen('compare')}
      onHowToPlay={() => setScreen('howtoplay')}
      onSwitchProfile={handleSwitchProfile}
    />
  )

  if (screen === 'performance') return <Performance profile={profile} sessions={sessions} onBack={() => setScreen('home')} />
  if (screen === 'history')     return <History     profile={profile} sessions={sessions} onBack={() => setScreen('home')} />
  if (screen === 'compare')     return <Compare     currentProfile={profile}              onBack={() => setScreen('home')} />
  if (screen === 'howtoplay')   return <HowToPlay   levels={levels}                       onBack={() => setScreen('home')} />

  return null
}
