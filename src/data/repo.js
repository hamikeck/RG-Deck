// Dove vivono i dati.
//
// Oggi: nel browser (localStorage) — funziona offline, niente account.
// Domani: Supabase. Basterà scrivere un `supabaseRepo` con gli stessi due
// metodi (load/save) e cambiare l'export in fondo: il resto dell'app non cambia.

import { SCHEMA_VERSION } from './seed.js'

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

export function migrate(data) {
  if (!data || typeof data !== 'object') return null
  // versione 1: nessuna migrazione ancora necessaria
  return {
    version: SCHEMA_VERSION,
    categories: data.categories || [],
    activities: data.activities || [],
    todos: data.todos || [],
    expenses: data.expenses || [],
    recurringExpenses: data.recurringExpenses || [],
    settings: { name: 'Raffaele', studyGoalDays: 5, leisureMaxHours: 6, ...(data.settings || {}) },
  }
}

export const repo = localRepo
