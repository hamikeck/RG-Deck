import { addDays, fromISO, startOfWeek, toMin } from './dates.js'
import { occurrenceCost, occurrencesBetween } from './recurrence.js'

/** Tutte le spese in un intervallo: manuali, da attività con costo, fisse mensili. */
export function expensesBetween(state, from, to, today) {
  const items = []
  for (const e of state.expenses) {
    if (e.date >= from && e.date <= to) items.push({ key: e.id, date: e.date, title: e.title, amount: e.amount, categoryId: e.categoryId, source: 'manual', refId: e.id })
  }
  for (const occ of occurrencesBetween(state.activities, from, to)) {
    const amount = occurrenceCost(occ)
    if (amount) items.push({ key: 'occ:' + occ.key, date: occ.date, title: occ.title, amount, categoryId: occ.categoryId, source: 'activity', refId: occ.activityId })
  }
  for (const r of state.recurringExpenses) {
    for (let d = from; d <= to; d = addDays(d, 1)) {
      if (d < r.since) continue
      if (r.until && d > r.until) continue
      if (fromISO(d).getDate() === r.day) items.push({ key: `rec:${r.id}@${d}`, date: d, title: r.title, amount: r.amount, categoryId: r.categoryId, source: 'recurring', refId: r.id })
    }
  }
  return items
    .map((x) => ({ ...x, planned: x.date > today }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
}

export function sum(items) {
  return Math.round(items.reduce((s, x) => s + (Number(x.amount) || 0), 0) * 100) / 100
}

export function money(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100
  return '€' + (Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ','))
}

/** Numeri dei widget della settimana corrente. */
export function weekStats(state, today, minuteNow) {
  const monday = startOfWeek(today)
  const sunday = addDays(monday, 6)
  const occ = occurrencesBetween(state.activities, monday, sunday)
  const isPast = (o) => o.date < today || (o.date === today && toMin(o.end) <= minuteNow)

  const tennis = occ.filter((o) => o.categoryId === 'tennis' || o.categoryId === 'partita')
  const tennisNextToday = tennis.find((o) => o.date === today && toMin(o.end) > minuteNow) || null

  const studyDays = new Set(occ.filter((o) => o.categoryId === 'studio' && isPast(o)).map((o) => o.date))

  const tests = occ.filter((o) => o.kind === 'verifica' || o.kind === 'interrogazione')
  const nextTest = occurrencesBetween(state.activities, today, addDays(today, 21)).find(
    (o) => (o.kind === 'verifica' || o.kind === 'interrogazione') && !(o.date === today && toMin(o.end) <= minuteNow),
  ) || null

  const leisureMin = occ.filter((o) => o.categoryId === 'svago').reduce((s, o) => s + Math.max(0, toMin(o.end) - toMin(o.start)), 0)

  const spend = sum(expensesBetween(state, monday, sunday, today))

  return {
    tennis: { done: tennis.filter(isPast).length, total: tennis.length, nextToday: tennisNextToday },
    study: { days: studyDays.size, goal: state.settings.studyGoalDays },
    tests: { count: tests.length, next: nextTest },
    leisure: { hours: Math.round((leisureMin / 60) * 10) / 10, max: state.settings.leisureMaxHours },
    spend,
  }
}
