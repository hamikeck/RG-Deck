import { useRef, useState } from 'react'
import { CatIcon, Field, Icon, Sheet, Wordmark } from '../components/ui.jsx'
import { categoryUsage, useStore } from '../data/store.jsx'
import { ICONS, ICON_KEYS, PALETTE, PALETTE_KEYS } from '../lib/catalog.js'
import { todayISO } from '../lib/dates.js'

export default function Impostazioni({ openCategory, back, toast }) {
  const { state, updateSettings, importData, resetData } = useStore()
  const fileRef = useRef(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `rg-deck-backup-${todayISO()}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  async function onImport(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const ok = importData(JSON.parse(await file.text()))
      toast(ok ? 'Backup ripristinato' : 'Il file non è un backup di R.G DECK')
    } catch {
      toast('Il file non è un backup di R.G DECK')
    }
  }

  const num = (v, min, max, fallback) => Math.min(max, Math.max(min, parseInt(v, 10) || fallback))

  return (
    <div className="scr settings">
      <div className="hd in d1">
        <Wordmark />
        <button type="button" className="link only-mobile" onClick={back}>Fatto</button>
      </div>
      <h1 className="big in d1">Impostazioni</h1>

      <section className="in d2 card-list" aria-label="Profilo e obiettivi">
        <label className="set-row">
          <span>Nome</span>
          <input className="tin inline" value={state.settings.name} onChange={(e) => updateSettings({ name: e.target.value })} />
        </label>
        <label className="set-row">
          <span>Giorni di studio a settimana<small>obiettivo del widget Studio</small></span>
          <input className="tin inline num-in" type="number" min="1" max="7" inputMode="numeric" value={state.settings.studyGoalDays} onChange={(e) => updateSettings({ studyGoalDays: num(e.target.value, 1, 7, 5) })} />
        </label>
        <label className="set-row">
          <span>Svago massimo a settimana (ore)<small>per non esagerare</small></span>
          <input className="tin inline num-in" type="number" min="1" max="40" inputMode="numeric" value={state.settings.leisureMaxHours} onChange={(e) => updateSettings({ leisureMaxHours: num(e.target.value, 1, 40, 6) })} />
        </label>
      </section>

      <section className="in d3" aria-label="Categorie">
        <div className="h2row"><h2>Categorie</h2><button type="button" className="link" onClick={() => openCategory(null)}>+ Nuova</button></div>
        {state.categories.map((c) => (
          <button type="button" key={c.id} className="row ev" style={{ gridTemplateColumns: '32px 1fr auto' }} onClick={() => openCategory(c)}>
            <CatIcon cat={c} box={32} radius={9} />
            <span className="txt"><span className="t">{c.name}</span><span className="m">{PALETTE[c.color]?.name || ''}{c.school ? ' · con tipo (verifica, interrogazione…)' : ''}</span></span>
            <span className="muted"><Icon name="edit" size={17} /></span>
          </button>
        ))}
      </section>

      <section className="in d4" aria-label="Dati">
        <div className="h2row"><h2>I tuoi dati</h2></div>
        <p className="sub small">Per ora i dati restano su questo dispositivo. Fai ogni tanto un backup: se cancelli i dati del browser, lo ripristini da qui.</p>
        <div className="btn-row">
          <button type="button" className="secondary" onClick={exportData}><Icon name="download" size={18} /> Scarica backup</button>
          <button type="button" className="secondary" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="upload" size={18} /> Ripristina</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
        </div>
        {!confirmReset ? (
          <button type="button" className="danger-link" onClick={() => setConfirmReset(true)}><Icon name="trash" size={18} /> Ricomincia da zero</button>
        ) : (
          <div className="confirm">
            <span>Cancella tutto e rimette solo scuola, tennis e British. Non si può annullare.</span>
            <div className="btn-row">
              <button type="button" className="secondary" onClick={() => setConfirmReset(false)}>Annulla</button>
              <button type="button" className="danger-btn" onClick={() => { resetData(); setConfirmReset(false); toast('Dati azzerati') }}>Cancella tutto</button>
            </div>
          </div>
        )}
      </section>
      <p className="sub small foot-note">R.G DECK · v1.0</p>
    </div>
  )
}

export function CategorySheet({ category, onClose, toast }) {
  const { state, saveCategory, removeCategory } = useStore()
  const [f, setF] = useState(() => category || { name: '', icon: 'stella', color: 'azzurro', school: false })
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const used = category ? categoryUsage(state, category.id) : 0

  function save() {
    if (!f.name.trim()) return toast('Dai un nome alla categoria')
    saveCategory({ ...f, name: f.name.trim() })
    toast('Categoria salvata')
    onClose()
  }

  function remove() {
    if (used) return toast(`È usata da ${used} ${used === 1 ? 'elemento' : 'elementi'}: prima spostali o eliminali`)
    if (state.categories.length <= 1) return toast('Serve almeno una categoria')
    removeCategory(category.id)
    toast('Categoria eliminata')
    onClose()
  }

  return (
    <Sheet
      title={category ? 'Modifica categoria' : 'Nuova categoria'}
      onClose={onClose}
      onSave={save}
      footer={
        <div className="sheet-foot">
          <button type="button" className="primary" onClick={save}>Salva categoria <i /></button>
          {category && <button type="button" className="danger-link" onClick={remove}><Icon name="trash" size={18} /> Elimina categoria</button>}
        </div>
      }
    >
      <div className="cat-preview"><CatIcon cat={f} box={56} radius={16} /><span>{f.name || 'Nuova categoria'}</span></div>
      <div className="field">
        <label htmlFor="cat-name" className="lbl">Nome</label>
        <input id="cat-name" className="title-input" value={f.name} placeholder="Es. Palestra" autoComplete="off" onChange={(e) => set({ name: e.target.value })} />
      </div>
      <Field label="Icona">
        <div className="icon-grid" role="group" aria-label="Icona">
          {ICON_KEYS.map((k) => (
            <button type="button" key={k} className={f.icon === k ? 'on' : ''} aria-pressed={f.icon === k} aria-label={k} onClick={() => set({ icon: k })}>
              <Icon d={ICONS[k]} size={20} />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Colore">
        <div className="swatches" role="group" aria-label="Colore">
          {PALETTE_KEYS.map((k) => (
            <button type="button" key={k} className={f.color === k ? 'on' : ''} aria-pressed={f.color === k} aria-label={PALETTE[k].name} style={{ background: PALETTE[k].bg, color: PALETTE[k].ink }} onClick={() => set({ color: k })}>
              <Icon d={ICONS[f.icon]} size={16} stroke={2.2} />
            </button>
          ))}
        </div>
      </Field>
      <label className="set-row plain">
        <span>Ha un tipo (verifica, interrogazione…)<small>utile per la scuola: conta le verifiche nel widget</small></span>
        <input type="checkbox" checked={!!f.school} onChange={(e) => set({ school: e.target.checked })} />
      </label>
    </Sheet>
  )
}
