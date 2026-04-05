import { useState, useEffect, useCallback } from 'react'
import { EXERCISES } from './constants.js'
import { getAllSessions, saveSession } from './lib/db.js'
import { Spinner } from './components/UI.jsx'
import ProfileSelect from './screens/ProfileSelect.jsx'
import Home from './screens/Home.jsx'
import Performance from './screens/Performance.jsx'
import Compare from './screens/Compare.jsx'
import History from './screens/History.jsx'
import Session from './screens/Session.jsx'

export default function App() {
  const [screen, setScreen] = useState('profiles')
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [loading, setLoading] = useState(false)

  // Session state
  const [exIndices, setExIndices] = useState([])
  const [isSingle, setIsSingle] = useState(false)

  const loadSessions = useCallback(async (p) => {
    setLoading(true)
    try {
      const data = await getAllSessions(p.id)
      setSessions(data)
    } catch (e) {
      console.error('Error loading sessions', e)
      setSessions([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (p) => {
    setProfile(p)
    await loadSessions(p)
    setScreen('home')
  }

  const handleStartFull = () => {
    setExIndices(EXERCISES.map((_, i) => i))
    setIsSingle(false)
    setScreen('session')
  }

  const handleStartSingle = (idx) => {
    setExIndices([idx])
    setIsSingle(true)
    setScreen('session')
  }

  const handleSessionComplete = async (scores, single) => {
    try {
      await saveSession(profile.id, scores, !single)
      await loadSessions(profile)
    } catch (e) {
      console.error('Error saving session', e)
    }
  }

  const handleSwitchProfile = () => {
    setProfile(null); setSessions(null); setScreen('profiles')
  }

  if (screen === 'profiles') return <ProfileSelect onLogin={handleLogin} />

  if (loading || !sessions) return <Spinner />

  if (screen === 'session') return (
    <Session
      profile={profile}
      exIndices={exIndices}
      isSingle={isSingle}
      onComplete={handleSessionComplete}
      onQuit={() => { loadSessions(profile); setScreen('home') }}
    />
  )

  if (screen === 'home') return (
    <Home
      profile={profile}
      sessions={sessions}
      onStartFull={handleStartFull}
      onStartSingle={handleStartSingle}
      onPerformance={() => setScreen('performance')}
      onHistory={() => setScreen('history')}
      onCompare={() => setScreen('compare')}
      onSwitchProfile={handleSwitchProfile}
    />
  )

  if (screen === 'performance') return (
    <Performance profile={profile} sessions={sessions} onBack={() => setScreen('home')} />
  )

  if (screen === 'history') return (
    <History profile={profile} sessions={sessions} onBack={() => setScreen('home')} />
  )

  if (screen === 'compare') return (
    <Compare currentProfile={profile} onBack={() => setScreen('home')} />
  )

  return null
}
