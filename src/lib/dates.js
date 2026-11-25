// Date "YYYY-MM-DD" in ora locale: niente fusi orari, niente sorprese.

export const DAY_SHORT = ['L', 'M', 'M', 'G', 'V', 'S', 'D']
export const DAY_ABBR = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
export const DAY_NAME = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
export const MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
export const MONTHS_SHORT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

export const pad = (n) => String(n).padStart(2, '0')

export function toISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromISO(s) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(now = new Date()) {
  return toISO(now)
}

export function addDays(s, n) {
  const d = fromISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** Lunedì = 0 … Domenica = 6 */
export function weekday(s) {
  return (fromISO(s).getDay() + 6) % 7
}

export function startOfWeek(s) {
  return addDays(s, -weekday(s))
}

export function weekDays(start) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function startOfMonth(s) {
  return s.slice(0, 8) + '01'
}

export function endOfMonth(s) {
  const d = fromISO(startOfMonth(s))
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  return toISO(d)
}

export function addMonths(s, n) {
  const d = fromISO(startOfMonth(s))
  d.setMonth(d.getMonth() + n)
  return toISO(d)
}

export function daysBetween(a, b) {
  return Math.round((fromISO(b) - fromISO(a)) / 86400000)
}

export function isoWeekNumber(s) {
  const d = fromISO(s)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const firstThursday = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7)
}

export function toMin(hm) {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

export function fromMin(min) {
  return `${pad(Math.floor(min / 60))}:${pad(min % 60)}`
}

export function nowMin(now = new Date()) {
  return now.getHours() * 60 + now.getMinutes()
}

export function durationLabel(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m} min`
  if (!m) return `${h}h`
  return `${h}h ${m}m`
}

export function dayNum(s) {
  return fromISO(s).getDate()
}

export function longDay(s) {
  return `${DAY_NAME[weekday(s)]} ${dayNum(s)}`
}

export function shortDate(s) {
  return `${DAY_ABBR[weekday(s)]} ${dayNum(s)} ${MONTHS_SHORT[fromISO(s).getMonth()]}`
}

export function weekRangeLabel(start) {
  const end = addDays(start, 6)
  const a = fromISO(start)
  const b = fromISO(end)
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`
  return `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]}`
}

export function monthLabel(s) {
  const d = fromISO(s)
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** "oggi", "domani", "tra 3 giorni", "ieri"… */
export function relativeDay(from, to) {
  const n = daysBetween(from, to)
  if (n === 0) return 'oggi'
  if (n === 1) return 'domani'
  if (n === -1) return 'ieri'
  if (n > 1) return `tra ${n} giorni`
  return `${-n} giorni fa`
}
