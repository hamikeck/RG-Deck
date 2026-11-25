// Orario scolastico vero di Raffaele (a.s. 2026/27).
// 6 ore da 60 minuti, dalle 8:00 alle 14:00, dal lunedì al venerdì.
// Ore consecutive della stessa materia diventano un blocco unico;
// la stessa materia alla stessa ora in giorni diversi diventa una sola serie.

const SUBJECTS = {
  storia: { title: 'Storia', teacher: 'M. Sica' },
  filosofia: { title: 'Filosofia', teacher: 'M. Sica' },
  mate: { title: 'Matematica', teacher: 'A. Ciccarelli' },
  motorie: { title: 'Scienze motorie', teacher: 'C. Gerbase' },
  discipline: { title: 'Discipline sportive', teacher: 'C. Gerbase' },
  italiano: { title: 'Italiano', teacher: 'G. Di Dona' },
  diritto: { title: 'Diritto ed economia', teacher: 'M. Abbiento' },
  inglese: { title: 'Inglese', teacher: 'S. Gerardi' },
  scienze: { title: 'Scienze naturali', teacher: 'A. Lopez' },
  fisica: { title: 'Fisica', teacher: 'D. Varavallo' },
  religione: { title: 'Religione', teacher: 'S. Lavecchia' },
}

// Indice 0 = lunedì. Ogni riga sono le 6 ore in ordine.
export const TIMETABLE = [
  ['storia', 'mate', 'mate', 'motorie', 'discipline', 'discipline'],
  ['filosofia', 'italiano', 'diritto', 'inglese', 'scienze', 'filosofia'],
  ['mate', 'diritto', 'italiano', 'inglese', 'fisica', 'motorie'],
  ['italiano', 'italiano', 'religione', 'inglese', 'scienze', 'fisica'],
  ['diritto', 'mate', 'motorie', 'storia', 'scienze', 'fisica'],
]

const FIRST_HOUR = 8
const hh = (h) => `${String(h).padStart(2, '0')}:00`

export function schoolActivities(monday) {
  const series = new Map()
  TIMETABLE.forEach((hours, day) => {
    let i = 0
    while (i < hours.length) {
      let j = i
      while (j + 1 < hours.length && hours[j + 1] === hours[i]) j++
      const key = `${hours[i]}|${i}|${j}`
      if (!series.has(key)) series.set(key, { subject: hours[i], from: i, to: j, days: [] })
      series.get(key).days.push(day)
      i = j + 1
    }
  })
  return [...series.values()].map(({ subject, from, to, days }) => {
    const s = SUBJECTS[subject]
    return {
      id: `act_sc_${subject}_${from + 1}${to > from ? `-${to + 1}` : ''}`,
      title: s.title,
      categoryId: 'scuola',
      kind: 'lezione',
      notes: `Prof. ${s.teacher}`,
      date: monday,
      start: hh(FIRST_HOUR + from),
      end: hh(FIRST_HOUR + to + 1),
      repeat: { freq: 'weekly', days, until: null },
      cost: null,
      exceptions: {},
    }
  })
}
