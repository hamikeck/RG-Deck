import { useState } from 'react'
import { CatIcon, Field, Icon, Sheet } from '../components/ui.jsx'
import { useStore } from '../data/store.jsx'
import { todayISO } from '../lib/dates.js'

function CategoryChips({ value, onChange }) {
  const { state } = useStore()
  return (
    <div className="chips" role="group" aria-label="Categoria">
      {state.categories.map((c) => (
        <button type="button" key={c.id} className={'chip' + (value === c.id ? ' on' : '')} aria-pressed={value === c.id} onClick={() => onChange(c.id)}>
          <CatIcon cat={c} box={24} radius={7} />
          {c.name}
        </button>
      ))}
    </div>
  )
}

function parseAmount(v) {
  const n = Number(String(v).replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null
}

export function ExpenseSheet({ expense, preset, onClose, toast }) {
  const { addExpense, updateExpense, removeExpense } = useStore()
  const [f, setF] = useState(() => expense ? { ...expense, amount: String(expense.amount) } : { title: '', amount: '', date: preset?.date || todayISO(), categoryId: 'acquisti' })
  const set = (p) => setF((x) => ({ ...x, ...p }))

  function save() {
    const amount = parseAmount(f.amount)
    if (!amount) return toast('Scrivi un importo')
    const data = { title: f.title.trim() || 'Spesa', amount, date: f.date || todayISO(), categoryId: f.categoryId }
    if (expense) updateExpense(expense.id, data)
    else addExpense(data)
    toast('Spesa salvata')
    onClose()
  }

  return (
    <Sheet
      title={expense ? 'Modifica spesa' : 'Nuova spesa'}
      onClose={onClose}
      onSave={save}
      footer={
        <div className="sheet-foot">
          <button type="button" className="primary" onClick={save}>Salva spesa <i /></button>
          {expense && <button type="button" className="danger-link" onClick={() => { removeExpense(expense.id); toast('Spesa eliminata'); onClose() }}><Icon name="trash" size={18} /> Elimina spesa</button>}
        </div>
      }
    >
      <div className="field">
        <label htmlFor="exp-title" className="lbl">Per cosa</label>
        <input id="exp-title" className="title-input" value={f.title} placeholder="Es. Pizza con gli amici" autoComplete="off" onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div className="when two">
        <label className="fld money"><span aria-hidden="true">€</span><span className="sr">Importo</span><input type="text" inputMode="decimal" placeholder="0" value={f.amount} onChange={(e) => set({ amount: e.target.value })} /></label>
        <label className="fld"><span className="sr">Giorno</span><input type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} /></label>
      </div>
      <Field label="Categoria"><CategoryChips value={f.categoryId} onChange={(categoryId) => set({ categoryId })} /></Field>
    </Sheet>
  )
}

export function RecurringSheet({ item, onClose, toast }) {
  const { addRecurringExpense, updateRecurringExpense, removeRecurringExpense } = useStore()
  const [f, setF] = useState(() => item ? { ...item, amount: String(item.amount), day: String(item.day) } : { title: '', amount: '', day: '1', categoryId: 'tennis', since: todayISO().slice(0, 8) + '01' })
  const set = (p) => setF((x) => ({ ...x, ...p }))

  function save() {
    const amount = parseAmount(f.amount)
    const day = Math.min(28, Math.max(1, parseInt(f.day, 10) || 1))
    if (!amount) return toast('Scrivi un importo')
    const data = { title: f.title.trim() || 'Spesa fissa', amount, day, categoryId: f.categoryId, since: f.since, until: f.until || null }
    if (item) updateRecurringExpense(item.id, data)
    else addRecurringExpense(data)
    toast('Spesa fissa salvata')
    onClose()
  }

  return (
    <Sheet
      title={item ? 'Modifica spesa fissa' : 'Nuova spesa fissa'}
      onClose={onClose}
      onSave={save}
      footer={
        <div className="sheet-foot">
          <button type="button" className="primary" onClick={save}>Salva <i /></button>
          {item && <button type="button" className="danger-link" onClick={() => { removeRecurringExpense(item.id); toast('Spesa fissa eliminata'); onClose() }}><Icon name="trash" size={18} /> Elimina spesa fissa</button>}
        </div>
      }
    >
      <div className="field">
        <label htmlFor="rec-title" className="lbl">Per cosa</label>
        <input id="rec-title" className="title-input" value={f.title} placeholder="Es. Quota circolo" autoComplete="off" onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div className="when two">
        <label className="fld money"><span aria-hidden="true">€</span><span className="sr">Importo al mese</span><input type="text" inputMode="decimal" placeholder="0" value={f.amount} onChange={(e) => set({ amount: e.target.value })} /></label>
        <label className="fld"><span className="fld-pre">Giorno</span><input type="number" min="1" max="28" inputMode="numeric" value={f.day} aria-label="Giorno del mese" onChange={(e) => set({ day: e.target.value })} /></label>
      </div>
      <span className="hint">Ogni mese, nel giorno scelto, finisce in Spese.</span>
      <Field label="Categoria"><CategoryChips value={f.categoryId} onChange={(categoryId) => set({ categoryId })} /></Field>
    </Sheet>
  )
}
