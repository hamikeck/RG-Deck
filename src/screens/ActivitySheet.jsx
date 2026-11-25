import { useState } from 'react'
import { CatIcon, Field, Icon, ScopeDialog, Segmented, Sheet, Switch } from '../components/ui.jsx'
import { useStore } from '../data/store.jsx'
import { SCHOOL_KINDS } from '../lib/catalog.js'
import { DAY_NAME, DAY_SHORT, fromMin, toMin, weekday } from '../lib/dates.js'
import { isRecurring } from '../lib/recurrence.js'

/**
 * Nuova attività (preset) oppure modifica di un'occorrenza (occ).
 */
export default function ActivitySheet({ occ, preset, onClose, onManageCategories, toast }) {
  const { state, addActivity, editOccurrence, deleteOccurrence } = useStore()
  const series = occ ? state.activities.find((a) => a.id === occ.activityId) : null
  const editing = !!occ

  const [f, setF] = useState(() => {
    if (occ) {
      return {
        title: occ.title,
        categoryId: occ.categoryId,
        kind: occ.kind || null,
        date: occ.date,
        start: occ.start,
        end: occ.end,
        repeat: series ? { freq: 'none', days: [], until: null, ...series.repeat } : { freq: 'none', days: [] },
        cost: occ.cost,
        notes: occ.notes || '',
      }
    }
    const start = preset?.start || '16:00'
    return {
      title: '',
      categoryId: preset?.categoryId || 'studio',
      kind: null,
      date: preset?.date,
      start,
      end: fromMin(Math.min(toMin(start) + 60, 23 * 60 + 59)),
      repeat: { freq: 'none', days: [weekday(preset?.date)], until: null },
      cost: null,
      notes: '',
    }
  })
  const [ask, setAsk] = useState(null) // 'save' | 'delete'
  const set = (patch) => setF((x) => ({ ...x, ...patch }))
  const cat = state.categories.find((c) => c.id === f.categoryId)
  const recurringSeries = series && isRecurring(series)

  function buildForm() {
    const title = f.title.trim() || (cat ? cat.name : 'Attività')
    const repeat =
      f.repeat.freq === 'weekly'
        ? { freq: 'weekly', days: f.repeat.days.length ? [...f.repeat.days].sort() : [weekday(f.date)], until: f.repeat.until || null }
        : f.repeat.freq === 'monthly'
          ? { freq: 'monthly', until: f.repeat.until || null }
          : { freq: 'none' }
    const cost = f.cost && Number(f.cost.amount) > 0 ? { amount: Math.round(Number(f.cost.amount) * 100) / 100, per: f.cost.per || 'each' } : null
    return { title, categoryId: f.categoryId, kind: cat && cat.school ? f.kind || null : null, date: f.date, start: f.start, end: f.end, repeat, cost, notes: f.notes.trim() }
  }

  function valid() {
    if (!f.date) return toast('Scegli un giorno'), false
    if (!f.start || !f.end || toMin(f.end) <= toMin(f.start)) return toast('L’orario di fine deve essere dopo l’inizio'), false
    return true
  }

  function save(scope) {
    if (!valid()) return
    const form = buildForm()
    if (!editing) {
      addActivity(form)
      toast(`“${form.title}” aggiunta`)
    } else {
      editOccurrence(occ, form, scope || 'all')
      toast('Modifiche salvate')
    }
    onClose()
  }

  function remove(scope) {
    deleteOccurrence(occ, scope || 'all')
    toast('Attività eliminata')
    onClose()
  }

  const repeatOpts = [
    ['none', 'Mai'],
    ['weekly', 'Ogni settimana'],
    ['monthly', 'Ogni mese'],
  ]

  return (
    <Sheet
      title={editing ? 'Modifica attività' : 'Nuova attività'}
      onClose={onClose}
      onSave={() => (recurringSeries ? valid() && setAsk('save') : save())}
      footer={
        <div className="sheet-foot">
          <button type="button" className="primary" onClick={() => (recurringSeries ? valid() && setAsk('save') : save())}>
            {editing ? 'Salva modifiche' : 'Salva attività'} <i />
          </button>
          {editing && (
            <button type="button" className="danger-link" onClick={() => (recurringSeries ? setAsk('delete') : remove())}>
              <Icon name="trash" size={18} /> Elimina attività
            </button>
          )}
        </div>
      }
    >
      <div className="field">
        <label htmlFor="act-title" className="lbl">Nome</label>
        <input id="act-title" className="title-input" value={f.title} placeholder={cat ? cat.name : 'Cosa devi fare?'} autoComplete="off" onChange={(e) => set({ title: e.target.value })} />
      </div>

      <Field label="Categoria">
        <div className="chips" role="group" aria-label="Categoria">
          {state.categories.map((c) => (
            <button type="button" key={c.id} className={'chip' + (f.categoryId === c.id ? ' on' : '')} aria-pressed={f.categoryId === c.id} onClick={() => set({ categoryId: c.id })}>
              <CatIcon cat={c} box={24} radius={7} />
              {c.name}
            </button>
          ))}
          <button type="button" className="chip add" onClick={onManageCategories}>+ Gestisci</button>
        </div>
      </Field>

      {cat && cat.school && (
        <Field label="Tipo">
          <div className="chips" role="group" aria-label="Tipo">
            {SCHOOL_KINDS.map(([k, l]) => (
              <button type="button" key={k} className={'pill' + (f.kind === k ? ' on' : '')} aria-pressed={f.kind === k} onClick={() => set({ kind: f.kind === k ? null : k })}>
                {l}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Quando">
        <div className="when">
          <label className="fld"><span className="sr">Giorno</span><input type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} /></label>
          <label className="fld"><span className="sr">Inizio</span><input type="time" value={f.start} onChange={(e) => set({ start: e.target.value })} /></label>
          <label className="fld"><span className="sr">Fine</span><input type="time" value={f.end} onChange={(e) => set({ end: e.target.value })} /></label>
        </div>
      </Field>

      <Field label="Ripeti" hint={recurringSeries ? 'Quando salvi ti chiedo se vale solo per questa volta o anche per le prossime.' : null}>
        <Segmented label="Ripeti" options={repeatOpts} value={f.repeat.freq} onChange={(freq) => set({ repeat: { ...f.repeat, freq, days: f.repeat.days && f.repeat.days.length ? f.repeat.days : [weekday(f.date)] } })} />
        {f.repeat.freq === 'weekly' && (
          <div className="weekdays" role="group" aria-label="Giorni">
            {DAY_SHORT.map((d, i) => {
              const on = f.repeat.days.includes(i)
              return (
                <button type="button" key={i} className={'wd' + (on ? ' on' : '')} aria-pressed={on} aria-label={DAY_NAME[i]} onClick={() => set({ repeat: { ...f.repeat, days: on ? f.repeat.days.filter((x) => x !== i) : [...f.repeat.days, i] } })}>
                  {d}
                </button>
              )
            })}
          </div>
        )}
        {f.repeat.freq !== 'none' && (
          <label className="until">
            <span>Fino al</span>
            <input type="date" value={f.repeat.until || ''} min={f.date} onChange={(e) => set({ repeat: { ...f.repeat, until: e.target.value || null } })} />
            {!f.repeat.until && <em>sempre</em>}
          </label>
        )}
      </Field>

      <div className="field">
        <div className="row-between">
          <span className="lbl">Costo</span>
          <Switch label="Ha un costo" checked={!!f.cost} onChange={(on) => set({ cost: on ? { amount: '', per: 'each' } : null })} />
        </div>
        {f.cost && (
          <>
            <div className="cost">
              <label className="fld money"><span aria-hidden="true">€</span><span className="sr">Importo</span><input type="text" inputMode="decimal" placeholder="0" value={f.cost.amount} onChange={(e) => set({ cost: { ...f.cost, amount: e.target.value.replace(',', '.') } })} /></label>
              <Segmented label="Quando si paga" options={[['each', 'Ogni volta'], ['once', 'Una volta']]} value={f.cost.per} onChange={(per) => set({ cost: { ...f.cost, per } })} />
            </div>
            <span className="hint">Finisce in Spese da solo, nel giorno dell’attività.</span>
          </>
        )}
      </div>

      <div className="field">
        <label htmlFor="act-notes" className="lbl">Note</label>
        <textarea id="act-notes" className="tin" rows={2} value={f.notes} placeholder="Es. portare il quaderno" onChange={(e) => set({ notes: e.target.value })} />
      </div>

      {ask && <ScopeDialog action={ask} onCancel={() => setAsk(null)} onPick={(scope) => (ask === 'delete' ? remove(scope) : save(scope))} />}
    </Sheet>
  )
}
