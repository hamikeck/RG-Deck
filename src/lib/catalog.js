// Icone (griglia 24, tratto 2) e colori adatti anche a chi è daltonico.
// Il colore è solo un aiuto: ogni categoria si riconosce dall'icona e dal nome.

export const ICONS = {
  scuola: 'M3 9.5l9-5 9 5-9 5-9-5z M7 11.7V16c0 1.2 2.2 2.8 5 2.8s5-1.6 5-2.8v-4.3 M21 9.5V15',
  libro: 'M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5z M12 6.5v13',
  pallina: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M4.6 7.2c4.2 2.2 4.2 7.4 0 9.6 M19.4 7.2c-4.2 2.2-4.2 7.4 0 9.6',
  coppa: 'M8 4h8v5a4 4 0 0 1-8 0V4z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M8 20h8 M12 17v3',
  fumetto: 'M4 5h16v11H10l-4 4v-4H4z M8 9.5h8 M8 12.5h5',
  joystick: 'M7 8h10a4 4 0 0 1 4 4v1.5a2.5 2.5 0 0 1-4.6 1.4L15 13H9l-1.4 1.9A2.5 2.5 0 0 1 3 13.5V12a4 4 0 0 1 4-4z M7.5 10.5v3 M6 12h3 M16 11h.01 M17.5 13h.01',
  persone: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5 M15.5 5.2a3 3 0 0 1 0 5.6 M17 14.2c2.2.6 3.5 2.4 3.5 4.8',
  orologio: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3.5 2',
  cuore: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  borsa: 'M5 8h14l-1.2 12H6.2L5 8z M9 8V6.5a3 3 0 0 1 6 0V8',
  manubrio: 'M6 8v8 M18 8v8 M3 10v4 M21 10v4 M6 12h12',
  musica: 'M9 18V6l10-2v12 M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  stella: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  corsa: 'M13 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M6 21l3-6 3 2v5 M9 15l1-5 4 2 3-1 M10 10l-3 1-1 3',
  valigia: 'M4 8h16v11H4z M9 8V5h6v3 M4 13h16',
  aereo: 'M3 14l18-7-7 18-2-8-9-3z',
  forbici: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.1 7.9L20 20 M8.1 16.1L20 4',
  medico: 'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
  pennello: 'M14 4l6 6-8 8H6v-6z M3 21l3-3',
  pizza: 'M12 3L3 20h18z M9 12h.01 M13 15h.01 M12 9h.01',
}

export const ICON_KEYS = Object.keys(ICONS)

export const UI_ICONS = {
  oggi: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M4 8c5 2 5 6 0 8M20 8c-5 2-5 6 0 8',
  cal: 'M3 9h18 M8 3v4 M16 3v4 M7 5h10a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z',
  spese: 'M4 20V10 M10 20V4 M16 20v-7',
  todo: 'M9 4h6a5 5 0 0 1 5 5v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5z M8.5 12l2.5 2.5L16 9.5',
  plus: 'M12 5v14 M5 12h14',
  rec: 'M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5',
  check: 'M5 12.5l4.5 4.5L19 7',
  left: 'M15 6l-6 6 6 6',
  right: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12 M18 6L6 18',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  trash: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3',
  edit: 'M4 20h4L19 9l-4-4L4 16z M14 6l4 4',
  download: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  upload: 'M12 20V9 M7 14l5-5 5 5 M5 4h14',
}

// bg = sfondo blocco, ink = icona/testo sopra, dot = colore pieno
export const PALETTE = {
  azzurro: { name: 'Azzurro', bg: '#DDEFFA', ink: '#0B4A73', dot: '#3A9AD9' },
  giallo: { name: 'Giallo', bg: '#FBF3C4', ink: '#5C4B00', dot: '#C9A800' },
  blu: { name: 'Blu', bg: '#1F3F8F', ink: '#DDF247', dot: '#1F3F8F' },
  righe: { name: 'Blu a righe', bg: 'repeating-linear-gradient(135deg,#1F3F8F 0 4px,#3A5BB0 4px 8px)', ink: '#FFFFFF', dot: '#1F3F8F' },
  vermiglio: { name: 'Vermiglio', bg: '#F9DFCC', ink: '#7A3400', dot: '#D55E00' },
  verde: { name: 'Verde acqua', bg: '#CCEDE2', ink: '#00553E', dot: '#009E73' },
  arancio: { name: 'Arancio', bg: '#FCEBC5', ink: '#6B4A00', dot: '#E69F00' },
  grigio: { name: 'Grigio', bg: '#E4E7EC', ink: '#3A4150', dot: '#7A8394' },
  rosa: { name: 'Rosa', bg: '#F6DEEB', ink: '#6E2A52', dot: '#CC79A7' },
  viola: { name: 'Viola', bg: '#ECE6FA', ink: '#3D2A80', dot: '#7A5FC4' },
}

export const PALETTE_KEYS = Object.keys(PALETTE)

export const SCHOOL_KINDS = [
  ['lezione', 'Lezione'],
  ['verifica', 'Verifica'],
  ['interrogazione', 'Interrogazione'],
  ['compito', 'Compito'],
  ['scadenza', 'Scadenza'],
]

export function kindLabel(kind) {
  const k = SCHOOL_KINDS.find((x) => x[0] === kind)
  return k ? k[1] : ''
}
