import { useEffect, useRef, useState } from 'react'
import { ICONS, PALETTE, UI_ICONS } from '../lib/catalog.js'

export function Icon({ d, name, size = 20, stroke = 2, className, style }) {
  const path = d || UI_ICONS[name] || ICONS[name] || ''
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

/** Quadratino colorato con l'icona della categoria */
export function CatIcon({ cat, box = 28, size, radius = 8 }) {
  const p = PALETTE[cat.color] || PALETTE.grigio
  return (
    <span className="cat-ico" style={{ width: box, height: box, borderRadius: radius, background: p.bg, color: p.ink }}>
      <Icon d={ICONS[cat.icon] || ICONS.stella} size={size || Math.round(box * 0.56)} stroke={2.2} />
    </span>
  )
}

export function Wordmark({ size = 22 }) {
  return (
    <span className="wm" style={{ fontSize: size }} aria-label="R.G DECK">
      R<i aria-hidden="true" />G<b>DECK</b>
    </span>
  )
}

export function Sheet({ title, onClose, onSave, saveLabel = 'Salva', children, footer }) {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.classList.add('locked')
    if (ref.current) ref.current.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('locked')
    }
  }, [onClose])
  return (
    <>
      <div className="dim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref} tabIndex={-1}>
        <span className="grab" aria-hidden="true" />
        <div className="sheet-head">
          <button type="button" className="link-muted" onClick={onClose}>Annulla</button>
          <h2>{title}</h2>
          {onSave ? <button type="button" className="link-strong" onClick={onSave}>{saveLabel}</button> : <span style={{ width: 60 }} />}
        </div>
        {children}
        {footer}
      </section>
    </>
  )
}

/** Chiede "solo questa volta / questa e le prossime / tutte" per le attività ricorrenti */
export function ScopeDialog({ action, onPick, onCancel }) {
  const verb = action === 'delete' ? 'Elimina' : 'Salva'
  return (
    <>
      <div className="dim" style={{ zIndex: 60 }} onClick={onCancel} />
      <div className="scope" role="alertdialog" aria-modal="true" aria-label="Attività ricorrente">
        <h3>{action === 'delete' ? 'Eliminare un’attività che si ripete' : 'Modificare un’attività che si ripete'}</h3>
        <p>Vale solo per questa volta o anche per le prossime?</p>
        <button type="button" className="scope-btn" onClick={() => onPick('this')}>{verb} solo questa volta</button>
        <button type="button" className="scope-btn" onClick={() => onPick('future')}>{verb} questa e le prossime</button>
        <button type="button" className={'scope-btn' + (action === 'delete' ? ' danger' : '')} onClick={() => onPick('all')}>{action === 'delete' ? 'Elimina tutta la serie' : 'Salva per tutte'}</button>
        <button type="button" className="scope-cancel" onClick={onCancel}>Annulla</button>
      </div>
    </>
  )
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label} style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map(([v, l]) => (
        <button type="button" key={v} className={value === v ? 'on' : ''} aria-pressed={value === v} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  )
}

export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={'swt' + (checked ? ' on' : '')} onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

export function Field({ label, children, hint }) {
  return (
    <div className="field">
      <span className="lbl">{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

export function Empty({ icon = 'stella', title, text, action }) {
  return (
    <div className="empty">
      <span className="empty-ico"><Icon name={icon} size={22} /></span>
      <strong>{title}</strong>
      {text && <span>{text}</span>}
      {action}
    </div>
  )
}

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs)
    const onVis = () => document.visibilityState === 'visible' && setNow(new Date())
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [intervalMs])
  return now
}

export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2400)
    return () => clearTimeout(t)
  }, [msg])
  const node = msg ? <div className="toast" role="status">{msg}</div> : null
  return [node, setMsg]
}
