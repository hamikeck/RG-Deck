import { useState } from 'react'
import { Empty, Icon, Sheet, Wordmark } from '../components/ui.jsx'
import { useStore } from '../data/store.jsx'
import { addDays, startOfWeek, todayISO } from '../lib/dates.js'
import TodoRow from './TodoRow.jsx'

export default function Todo({ now, openTodo, openSettings }) {
  const { state, addTodo, toggleTodo, clearDoneTodos } = useStore()
  const today = todayISO(now)
  const endWeek = addDays(startOfWeek(today), 6)
  const [text, setText] = useState('')
  const [due, setDue] = useState(null)
  const [showDone, setShowDone] = useState(false)

  const open = state.todos.filter((t) => !t.done)
  const done = state.todos.filter((t) => t.done)
  const byDue = (a, b) => (a.due || '9999').localeCompare(b.due || '9999')
  const groups = [
    ['In ritardo', open.filter((t) => t.due && t.due < today)],
    ['Oggi', open.filter((t) => t.due === today)],
    ['Questa settimana', open.filter((t) => t.due && t.due > today && t.due <= endWeek)],
    ['Più avanti', open.filter((t) => t.due && t.due > endWeek)],
    ['Senza data', open.filter((t) => !t.due)],
  ].filter((g) => g[1].length)

  const dueOpts = [
    [null, 'Senza data'],
    [today, 'Oggi'],
    [addDays(today, 1), 'Domani'],
    [endWeek > addDays(today, 1) ? endWeek : null, 'Entro domenica'],
  ].filter((o, i) => i === 0 || o[0])

  function submit(e) {
    e.preventDefault()
    const v = text.trim()
    if (!v) return
    addTodo({ text: v, due })
    setText('')
  }

  return (
    <div className="scr todo-scr">
      <div className="hd in d1">
        <Wordmark />
        <span className="hd-right">
          <span className="sub small strong">{open.length} da fare</span>
          <button type="button" className="icon-btn only-mobile" aria-label="Impostazioni" onClick={openSettings}><Icon name="gear" size={20} /></button>
        </span>
      </div>
      <h1 className="big in d1">Da fare</h1>

      <form className="in d2 quick" onSubmit={submit}>
        <div className="quick-row">
          <label htmlFor="qa" className="sr">Nuova cosa da fare</label>
          <input id="qa" className="tin" value={text} placeholder="Aggiungi qualcosa…" autoComplete="off" enterKeyHint="done" onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="add-btn tap" aria-label="Aggiungi"><Icon name="plus" size={20} stroke={2.6} /></button>
        </div>
        <div className="chips" role="group" aria-label="Scadenza">
          {dueOpts.map(([v, l]) => (
            <button type="button" key={l} className={'pill small' + (due === v ? ' on' : '')} aria-pressed={due === v} onClick={() => setDue(v)}>{l}</button>
          ))}
        </div>
      </form>

      {open.length === 0 && <Empty icon="todo" title="Tutto fatto" text="Scrivi qui sopra le cose piccole da ricordare." />}

      {groups.map(([name, list]) => (
        <section key={name} className="in d3" aria-label={name}>
          <div className="h2row"><h2 className={'group-h' + (name === 'In ritardo' ? ' late' : '')}>{name}</h2><span className="sub small">{list.length}</span></div>
          {list.sort(byDue).map((t) => <TodoRow key={t.id} t={t} today={today} onToggle={() => toggleTodo(t.id)} onEdit={() => openTodo(t)} />)}
        </section>
      ))}

      {done.length > 0 && (
        <section className="in d4" aria-label="Completati">
          <div className="h2row">
            <button type="button" className="group-h link-plain" aria-expanded={showDone} onClick={() => setShowDone(!showDone)}>Completati ({done.length}) {showDone ? '▴' : '▾'}</button>
            {showDone && <button type="button" className="link" onClick={clearDoneTodos}>Svuota</button>}
          </div>
          {showDone && done.map((t) => <TodoRow key={t.id} t={t} today={today} onToggle={() => toggleTodo(t.id)} onEdit={() => openTodo(t)} />)}
        </section>
      )}
    </div>
  )
}

export function TodoSheet({ todo, onClose, toast }) {
  const { updateTodo, removeTodo } = useStore()
  const [text, setText] = useState(todo.text)
  const [due, setDue] = useState(todo.due || '')
  function save() {
    if (!text.trim()) return toast('Scrivi qualcosa')
    updateTodo(todo.id, { text: text.trim(), due: due || null })
    onClose()
  }
  return (
    <Sheet
      title="Modifica"
      onClose={onClose}
      onSave={save}
      footer={
        <div className="sheet-foot">
          <button type="button" className="primary" onClick={save}>Salva <i /></button>
          <button type="button" className="danger-link" onClick={() => { removeTodo(todo.id); toast('Eliminato'); onClose() }}><Icon name="trash" size={18} /> Elimina</button>
        </div>
      }
    >
      <div className="field">
        <label htmlFor="td-text" className="lbl">Cosa</label>
        <input id="td-text" className="title-input" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="td-due" className="lbl">Entro il</label>
        <div className="when two">
          <label className="fld"><input id="td-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} /></label>
          <button type="button" className="fld" onClick={() => setDue('')}>Senza data</button>
        </div>
      </div>
    </Sheet>
  )
}
