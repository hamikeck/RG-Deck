// Attività singole e ricorrenti, con eccezioni per singola data.
//
// activity = {
//   id, title, categoryId, kind?, notes?,
//   date: 'YYYY-MM-DD'        // giorno (singola) o inizio della serie (ricorrente)
//   start: 'HH:MM', end: 'HH:MM',
//   repeat: { freq: 'none' | 'weekly' | 'monthly', days?: number[] (0 = lunedì), until?: 'YYYY-MM-DD' | null },
//   cost: { amount: number, per: 'once' | 'each' } | null,
//   exceptions: { [date]: { skip: true } | { override: {...campi} } }
// }

import { addDays, fromISO, weekday } from './dates.js'

export const OVERRIDABLE = ['title', 'categoryId', 'kind', 'start', 'end', 'notes', 'cost']

let counter = 0
export function newId(prefix = 'id') {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function isRecurring(a) {
  return !!a.repeat && a.repeat.freq !== 'none'
}

export function occursOn(a, date) {
  if (date < a.date) return false
  const r = a.repeat || { freq: 'none' }
  if (r.until && date > r.until) return false
  if (r.freq === 'none') return date === a.date
  if (r.freq === 'weekly') return (r.days || []).includes(weekday(date))
  if (r.freq === 'monthly') return fromISO(date).getDate() === fromISO(a.date).getDate()
  return false
}

export function occurrencesOn(activities, date) {
  const out = []
  for (const a of activities) {
    if (!occursOn(a, date)) continue
    const ex = a.exceptions && a.exceptions[date]
    if (ex && ex.skip) continue
    const o = ex && ex.override ? { ...a, ...ex.override } : a
    out.push({
      key: `${a.id}@${date}`,
      activityId: a.id,
      date,
      title: o.title,
      categoryId: o.categoryId,
      kind: o.kind || null,
      start: o.start,
      end: o.end,
      notes: o.notes || '',
      cost: o.cost || null,
      recurring: isRecurring(a),
      seriesStart: a.date,
      overridden: !!(ex && ex.override),
    })
  }
  return out.sort((x, y) => x.start.localeCompare(y.start) || x.title.localeCompare(y.title))
}

export function occurrencesBetween(activities, from, to) {
  const out = []
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(...occurrencesOn(activities, d))
  return out
}

function pick(obj, keys) {
  const o = {}
  for (const k of keys) if (k in obj) o[k] = obj[k]
  return o
}

/**
 * Applica le modifiche di un form a un'occorrenza.
 * scope: 'this' (solo questa volta) | 'future' (questa e le prossime) | 'all' (tutta la serie)
 * Per un'attività singola lo scope viene ignorato.
 */
export function editOccurrence(activities, activityId, date, form, scope = 'all') {
  const a = activities.find((x) => x.id === activityId)
  if (!a) return activities
  const rest = activities.filter((x) => x.id !== activityId)

  if (!isRecurring(a)) {
    return [...rest, { ...a, ...form, exceptions: {} }].sort(byCreated(activities))
  }

  if (scope === 'this') {
    const exceptions = { ...(a.exceptions || {}) }
    if (form.date && form.date !== date) {
      exceptions[date] = { skip: true }
      const moved = { ...pick({ ...a, ...form }, ['title', 'categoryId', 'kind', 'start', 'end', 'notes', 'cost']), id: newId('act'), date: form.date, repeat: { freq: 'none' }, exceptions: {} }
      return [...rest, { ...a, exceptions }, moved].sort(byCreated(activities))
    }
    exceptions[date] = { override: pick(form, OVERRIDABLE) }
    return [...rest, { ...a, exceptions }].sort(byCreated(activities))
  }

  if (scope === 'future' && date > a.date) {
    const oldExceptions = {}
    const newExceptions = {}
    for (const [d, ex] of Object.entries(a.exceptions || {})) (d < date ? oldExceptions : newExceptions)[d] = ex
    const ended = { ...a, repeat: { ...a.repeat, until: addDays(date, -1) }, exceptions: oldExceptions }
    const next = { ...a, ...form, id: newId('act'), date: form.date && form.date > date ? form.date : date, exceptions: newExceptions }
    return [...rest, ended, next].sort(byCreated(activities))
  }

  // 'all' (oppure 'future' dal primo giorno della serie): cambia tutta la serie
  const keepStart = form.repeat && form.repeat.freq !== 'none'
  return [...rest, { ...a, ...form, date: keepStart ? a.date : form.date || a.date }].sort(byCreated(activities))
}

/** scope come sopra */
export function deleteOccurrence(activities, activityId, date, scope = 'all') {
  const a = activities.find((x) => x.id === activityId)
  if (!a) return activities
  const rest = activities.filter((x) => x.id !== activityId)
  if (!isRecurring(a) || scope === 'all') return rest
  if (scope === 'this') {
    return [...rest, { ...a, exceptions: { ...(a.exceptions || {}), [date]: { skip: true } } }].sort(byCreated(activities))
  }
  if (date <= a.date) return rest
  return [...rest, { ...a, repeat: { ...a.repeat, until: addDays(date, -1) } }].sort(byCreated(activities))
}

// mantiene l'ordine originale dell'elenco, i nuovi in fondo
function byCreated(original) {
  const order = new Map(original.map((x, i) => [x.id, i]))
  return (x, y) => (order.has(x.id) ? order.get(x.id) : 1e9) - (order.has(y.id) ? order.get(y.id) : 1e9)
}

/** Costo di un'occorrenza: 'each' = ogni volta, 'once' = solo il primo giorno */
export function occurrenceCost(occ) {
  if (!occ.cost || !occ.cost.amount) return 0
  if (occ.cost.per === 'once') return occ.date === occ.seriesStart ? occ.cost.amount : 0
  return occ.cost.amount
}
