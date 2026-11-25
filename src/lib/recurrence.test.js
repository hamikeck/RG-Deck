import { describe, expect, it } from 'vitest'
import { deleteOccurrence, editOccurrence, occurrenceCost, occurrencesBetween, occurrencesOn } from './recurrence.js'
import { expensesBetween, sum, weekStats } from './stats.js'
import { seedState } from '../data/seed.js'
import { isoWeekNumber, startOfWeek, weekday } from './dates.js'

const MON = '2026-11-23'
const tennis = { id: 't', title: 'Allenamento', categoryId: 'tennis', date: MON, start: '18:20', end: '20:00', repeat: { freq: 'weekly', days: [0, 4], until: null }, cost: null, exceptions: {} }

describe('date', () => {
  it('lunedì è il giorno 0', () => {
    expect(weekday(MON)).toBe(0)
    expect(startOfWeek('2026-11-29')).toBe(MON)
    expect(isoWeekNumber(MON)).toBe(48)
  })
})

describe('ricorrenze', () => {
  it('compare nei giorni giusti', () => {
    expect(occurrencesOn([tennis], MON)).toHaveLength(1)
    expect(occurrencesOn([tennis], '2026-11-24')).toHaveLength(0)
    expect(occurrencesOn([tennis], '2026-11-27')).toHaveLength(1)
    expect(occurrencesOn([tennis], '2026-11-16')).toHaveLength(0) // prima dell'inizio
  })

  it('solo questa volta: sposta l’orario di un giorno', () => {
    const next = editOccurrence([tennis], 't', '2026-11-27', { ...tennis, date: '2026-11-27', start: '17:00' }, 'this')
    expect(occurrencesOn(next, '2026-11-27')[0].start).toBe('17:00')
    expect(occurrencesOn(next, MON)[0].start).toBe('18:20')
  })

  it('solo questa volta: cambia giorno', () => {
    const next = editOccurrence([tennis], 't', '2026-11-27', { ...tennis, date: '2026-11-28' }, 'this')
    expect(occurrencesOn(next, '2026-11-27')).toHaveLength(0)
    expect(occurrencesOn(next, '2026-11-28')).toHaveLength(1)
    expect(occurrencesOn(next, '2026-12-04')).toHaveLength(1)
  })

  it('questa e le prossime: divide la serie', () => {
    const next = editOccurrence([tennis], 't', '2026-11-30', { ...tennis, date: '2026-11-30', start: '17:30' }, 'future')
    expect(next).toHaveLength(2)
    expect(occurrencesOn(next, '2026-11-27')[0].start).toBe('18:20')
    expect(occurrencesOn(next, '2026-11-30')[0].start).toBe('17:30')
    expect(occurrencesOn(next, '2026-12-07')[0].start).toBe('17:30')
  })

  it('tutta la serie', () => {
    const next = editOccurrence([tennis], 't', '2026-11-30', { ...tennis, date: '2026-11-30', title: 'Tennis' }, 'all')
    expect(occurrencesOn(next, MON)[0].title).toBe('Tennis')
  })

  it('elimina solo questa volta / le prossime / tutto', () => {
    expect(occurrencesOn(deleteOccurrence([tennis], 't', '2026-11-27', 'this'), '2026-11-27')).toHaveLength(0)
    const fut = deleteOccurrence([tennis], 't', '2026-11-30', 'future')
    expect(occurrencesBetween(fut, MON, '2026-12-31')).toHaveLength(2)
    expect(deleteOccurrence([tennis], 't', MON, 'all')).toHaveLength(0)
    expect(deleteOccurrence([tennis], 't', MON, 'future')).toHaveLength(0)
  })

  it('costo una volta sola o ogni volta', () => {
    const a = { ...tennis, cost: { amount: 10, per: 'once' } }
    const occ = occurrencesBetween([a], MON, '2026-12-06')
    expect(occ.map(occurrenceCost)).toEqual([10, 0, 0, 0])
    const b = { ...tennis, cost: { amount: 10, per: 'each' } }
    expect(sum(occurrencesBetween([b], MON, '2026-12-06').map((o) => ({ amount: occurrenceCost(o) })))).toBe(40)
  })
})

describe('dati iniziali e statistiche', () => {
  it('settimana tipo', () => {
    const s = seedState(new Date(2026, 10, 25, 9, 0))
    const wk = occurrencesBetween(s.activities, MON, '2026-11-29')
    expect(wk.filter((o) => o.categoryId === 'tennis')).toHaveLength(3)
    expect(wk.filter((o) => o.categoryId === 'british').map((o) => o.date)).toEqual(['2026-11-24'])
    expect(wk.filter((o) => o.categoryId === 'scuola')).toHaveLength(5)
    const st = weekStats(s, '2026-11-25', 9 * 60)
    expect(st.tennis).toMatchObject({ done: 1, total: 3 })
  })

  it('spese fisse mensili e manuali', () => {
    const s = { ...seedState(new Date(2026, 10, 25)), expenses: [{ id: 'e', title: 'Pizza', amount: 12.5, date: '2026-11-24', categoryId: 'amici' }], recurringExpenses: [{ id: 'r', title: 'Quota', amount: 40, day: 1, since: '2026-11-01', categoryId: 'tennis' }] }
    const items = expensesBetween(s, '2026-11-01', '2026-12-31', '2026-11-25')
    expect(sum(items)).toBe(92.5)
    expect(items.find((x) => x.date === '2026-12-01').planned).toBe(true)
  })
})
