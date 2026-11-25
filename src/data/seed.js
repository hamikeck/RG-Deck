// Dati iniziali: solo cose vere (orario scolastico, tennis, British).
// Tutto è modificabile o eliminabile dall'app.

import { startOfWeek, todayISO } from '../lib/dates.js'
import { schoolActivities } from './schoolTimetable.js'

export const SCHEMA_VERSION = 2

export function defaultCategories() {
  return [
    { id: 'scuola', name: 'Scuola', icon: 'scuola', color: 'azzurro', school: true },
    { id: 'studio', name: 'Studio', icon: 'libro', color: 'giallo' },
    { id: 'tennis', name: 'Tennis', icon: 'pallina', color: 'blu' },
    { id: 'partita', name: 'Partita', icon: 'coppa', color: 'righe' },
    { id: 'british', name: 'British', icon: 'fumetto', color: 'vermiglio' },
    { id: 'svago', name: 'Svago', icon: 'joystick', color: 'verde' },
    { id: 'amici', name: 'Amici', icon: 'persone', color: 'arancio' },
    { id: 'appuntamenti', name: 'Appuntamenti', icon: 'orologio', color: 'grigio' },
    { id: 'perme', name: 'Per me', icon: 'cuore', color: 'rosa' },
    { id: 'acquisti', name: 'Acquisti', icon: 'borsa', color: 'viola' },
  ]
}

export function seedState(now = new Date()) {
  const monday = startOfWeek(todayISO(now))
  const weekly = (days) => ({ freq: 'weekly', days, until: null })
  return {
    version: SCHEMA_VERSION,
    categories: defaultCategories(),
    activities: [
      ...schoolActivities(monday),
      { id: 'act_tennis_lv', title: 'Allenamento', categoryId: 'tennis', notes: '', date: monday, start: '18:20', end: '20:00', repeat: weekly([0, 4]), cost: null, exceptions: {} },
      { id: 'act_tennis_me', title: 'Allenamento', categoryId: 'tennis', notes: '', date: monday, start: '19:10', end: '20:00', repeat: weekly([2]), cost: null, exceptions: {} },
      { id: 'act_british', title: 'British', categoryId: 'british', notes: '', date: monday, start: '15:00', end: '16:15', repeat: weekly([1]), cost: null, exceptions: {} },
    ],
    todos: [],
    expenses: [],
    recurringExpenses: [],
    settings: { name: 'Raffaele', studyGoalDays: 5, leisureMaxHours: 6 },
  }
}
