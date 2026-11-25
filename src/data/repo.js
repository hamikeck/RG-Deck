// Dove vivono i dati.
//
// Oggi: nel browser (localStorage) — funziona offline, niente account.
// Domani: Supabase. Basterà scrivere un `supabaseRepo` con gli stessi due
// metodi (load/save) e cambiare l'export in fondo: il resto dell'app non cambia.

import { SCHEMA_VERSION } from './seed.js'
import { schoolActivities } from './schoolTimetable.js'
import { addDays as addDaysISO, startOfWeek, todayISO } from '../lib/dates.js'

const KEY = 'rgdeck:data:v1'

export const localRepo = {
  async load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      return migrate(data)
    } catch {
      return null
    }
  },
  async save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
      return true
    } catch {
      return false
    }
  },
}

export function migrate(data, now = new Date()) {
  if (!data || typeof data !== 'object') return null
  let activities = data.activities || []
  // v1 → v2: il blocco "Scuola 8–14" provvisorio diventa l'orario vero.
  // Si sostituisce solo se è ancora quello provvisorio (note intatte).
  if ((data.version || 1) < 2) {
    const old = activities.find((a) => a.id === 'act_scuola' && /provvisorio/i.test(a.notes || ''))
    if (old) {
      const monday = startOfWeek(todayISO(now))
      const ended = old.date < monday ? [{ ...old, repeat: { ...old.repeat, until: addDaysISO(monday, -1) } }] : []
      activities = [...activities.filter((a) => a !== old), ...ended, ...schoolActivities(monday)]
    }
  }
  return {
    version: SCHEMA_VERSION,
    categories: data.categories || [],
    activities,
    todos: data.todos || [],
    expenses: data.expenses || [],
    recurringExpenses: data.recurringExpenses || [],
    settings: { name: 'Raffaele', studyGoalDays: 5, leisureMaxHours: 6, ...(data.settings || {}) },
  }
}

export const repo = localRepo
