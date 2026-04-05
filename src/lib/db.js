import { supabase } from './supabase.js'

/* ── PIN helpers ── */
async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin + '_nexus'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/* ── Profiles ── */
export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_color, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createProfile(name, pin, avatarColor) {
  const pinHash = await hashPin(pin)
  const { data, error } = await supabase
    .from('profiles')
    .insert({ name, pin_hash: pinHash, avatar_color: avatarColor })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function verifyPin(profileId, pin) {
  const pinHash = await hashPin(pin)
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', profileId)
    .eq('pin_hash', pinHash)
    .single()
  if (error) return false
  return !!data
}

export async function deleteProfile(profileId) {
  const { error } = await supabase.from('profiles').delete().eq('id', profileId)
  if (error) throw error
}

/* ── Sessions ── */
export async function saveSession(profileId, scores, isFullSession) {
  const avg = Math.round(scores.reduce((a, s) => a + (s.points ?? 0), 0) / scores.length)
  const { data: session, error: sErr } = await supabase
    .from('sessions')
    .insert({ profile_id: profileId, avg_score: avg, is_full_session: isFullSession })
    .select()
    .single()
  if (sErr) throw sErr

  const exerciseRows = scores.map(s => ({
    session_id: session.id,
    exercise_id: s.id,
    points: s.points ?? 0,
    label: s.label ?? '',
    detail: s.detail ?? '',
  }))
  const { error: eErr } = await supabase.from('session_exercises').insert(exerciseRows)
  if (eErr) throw eErr

  return session
}

export async function getSessions(profileId, limit = 50) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, avg_score, is_full_session, created_at,
      session_exercises ( exercise_id, points, label, detail )
    `)
    .eq('profile_id', profileId)
    .eq('is_full_session', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getAllSessions(profileId, limit = 100) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, avg_score, is_full_session, created_at,
      session_exercises ( exercise_id, points, label, detail )
    `)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

/* ── Streak calculation ── */
export function computeStreak(sessions) {
  if (!sessions || sessions.length === 0) return { current: 0, best: 0 }
  const fullSessions = sessions.filter(s => s.is_full_session)
  if (fullSessions.length === 0) return { current: 0, best: 0 }

  // Get unique dates descending
  const dates = [...new Set(
    fullSessions.map(s => new Date(s.created_at).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b - a)

  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)

  let current = 0
  let best = 0
  let streak = 0
  let prev = null

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i]; d.setHours(0,0,0,0)
    if (i === 0) {
      if (d.getTime() === today.getTime() || d.getTime() === yesterday.getTime()) {
        streak = 1
      } else {
        streak = 0
      }
    } else {
      const diff = (prev - d) / 86400000
      if (diff === 1) { streak++ } else { streak = 1 }
    }
    prev = d
    best = Math.max(best, streak)
    if (i === 0) current = streak
  }

  // If most recent session was yesterday and we haven't played today, current stands
  // If most recent was before yesterday, current = 0
  const mostRecent = dates[0]; mostRecent.setHours(0,0,0,0)
  if (mostRecent < yesterday) current = 0

  return { current, best }
}

/* ── Performance stats ── */
export function computeStats(sessions) {
  if (!sessions || sessions.length === 0) return null

  const full = sessions.filter(s => s.is_full_session)
  const { current: streak, best: bestStreak } = computeStreak(sessions)

  // Last 10 full sessions for sparkline
  const last10 = full.slice(0, 10).map(s => s.avg_score).reverse()

  // Per exercise averages and best
  const byExercise = {}
  full.forEach(s => {
    s.session_exercises?.forEach(e => {
      if (!byExercise[e.exercise_id]) byExercise[e.exercise_id] = { scores: [], best: 0 }
      byExercise[e.exercise_id].scores.push(e.points)
      byExercise[e.exercise_id].best = Math.max(byExercise[e.exercise_id].best, e.points)
    })
  })

  const exerciseStats = {}
  Object.entries(byExercise).forEach(([id, data]) => {
    const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
    const last5 = data.scores.slice(-5)
    const first2avg = last5.slice(0, 2).reduce((a, b) => a + b, 0) / Math.max(last5.slice(0, 2).length, 1)
    const last2avg = last5.slice(-2).reduce((a, b) => a + b, 0) / Math.max(last5.slice(-2).length, 1)
    const trend = last5.length >= 3 ? (last2avg > first2avg + 3 ? 'up' : last2avg < first2avg - 3 ? 'down' : 'same') : 'same'
    exerciseStats[id] = { avg, best: data.best, trend, count: data.scores.length }
  })

  // Sessions last 7 days
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const sessionsThisWeek = full.filter(s => new Date(s.created_at) > weekAgo).length

  const overallAvg = full.length > 0
    ? Math.round(full.reduce((a, s) => a + s.avg_score, 0) / full.length)
    : 0

  return {
    totalSessions: full.length,
    overallAvg,
    streak,
    bestStreak,
    sessionsThisWeek,
    last10,
    exerciseStats,
  }
}
