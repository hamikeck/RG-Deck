import { useState } from 'react'
import { CatIcon, Empty, Icon, Segmented, Wordmark } from '../components/ui.jsx'
import { useCategory, useStore } from '../data/store.jsx'
import { PALETTE } from '../lib/catalog.js'
import { DAY_SHORT, addDays, addMonths, dayNum, endOfMonth, fromISO, monthLabel, startOfMonth, startOfWeek, todayISO, weekDays, weekRangeLabel } from '../lib/dates.js'
import { expensesBetween, money, sum } from '../lib/stats.js'

export default function Spese({ now, openExpense, openRecurring, openActivityById, openSettings }) {
  const { state } = useStore()
  const catOf = useCategory()
  const today = todayISO(now)
  const [mode, setMode] = useState('month')
  const [anchor, setAnchor] = useState(today)

  const from = mode === 'week' ? startOfWeek(anchor) : startOfMonth(anchor)
  const to = mode === 'week' ? addDays(from, 6) : endOfMonth(anchor)
  const items = expensesBetween(state, from, to, today)
  const spent = sum(items.filter((x) => !x.planned))
  const planned = sum(items.filter((x) => x.planned))
  const isCurrent = from <= today && today <= to

  // barre: giorni (settimana) o settimane (mese)
  let buckets
  if (mode === 'week') {
    buckets = weekDays(from).map((d, i) => ({ label: DAY_SHORT[i], from: d, to: d, cur: d === today }))
  } else {
    buckets = []
    for (let s = from; s <= to; ) {
      const e = addDays(startOfWeek(s), 6) < to ? addDays(startOfWeek(s), 6) : to
      buckets.push({ label: `${dayNum(s)}–${dayNum(e)}`, from: s, to: e, cur: s <= today && today <= e })
      s = addDays(e, 1)
    }
  }
  const vals = buckets.map((b) => {
    const its = items.filter((x) => x.date >= b.from && x.date <= b.to)
    return { ...b, done: sum(its.filter((x) => !x.planned)), plan: sum(its.filter((x) => x.planned)) }
  })
  const max = Math.max(1, ...vals.map((v) => v.done + v.plan))

  const byCat = {}
  for (const x of items) byCat[x.categoryId] = (byCat[x.categoryId] || 0) + x.amount
  const catRows = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const top = Math.max(1, ...catRows.map((r) => r[1]))

  function move(n) {
    setAnchor(mode === 'week' ? addDays(from, n * 7) : addMonths(from, n))
  }

  return (
    <div className="scr spese">
      <div className="hd in d1">
        <Wordmark />
        <span className="hd-right">
          <Segmented label="Periodo" options={[['week', 'Settimana'], ['month', 'Mese']]} value={mode} onChange={(m) => { setMode(m); setAnchor(today) }} />
          <button type="button" className="icon-btn only-mobile" aria-label="Impostazioni" onClick={openSettings}><Icon name="gear" size={20} /></button>
        </span>
      </div>

      <div className="in d1 period">
        <button type="button" className="round-btn" aria-label="Periodo precedente" onClick={() => move(-1)}><Icon name="left" size={16} stroke={2.2} /></button>
        <span className="period-lbl">{mode === 'week' ? weekRangeLabel(from) : monthLabel(from)}</span>
        <button type="button" className="round-btn" aria-label="Periodo successivo" onClick={() => move(1)}><Icon name="right" size={16} stroke={2.2} /></button>
        {!isCurrent && <button type="button" className="pill small" onClick={() => setAnchor(today)}>Oggi</button>}
      </div>

      <div className="spese-grid">
        <div className="col">
          <section className="in d1 total" aria-label="Totale">
            <span className="sub">Spesi</span>
            <span className="total-row"><span className="num xl">{money(spent)}</span>{planned > 0 && <span className="sub">+ {money(planned)} previsti</span>}</span>
          </section>

          <section className="in d2" aria-label="Andamento">
            <div className="bars" aria-hidden="true">
              {vals.map((v, i) => {
                const tot = v.done + v.plan
                const h = tot ? Math.max(Math.round((tot / max) * 92), 4) : 3
                const bg = v.plan && !v.done ? 'repeating-linear-gradient(135deg,#1F3F8F 0 3px,#DDEFFA 3px 7px)' : tot ? '#1F3F8F' : '#E4E7EC'
                return (
                  <div key={i}>
                    <small>{tot ? money(tot) : ''}</small>
                    <span className="sy" style={{ height: h, background: bg, animationDelay: `${0.12 + i * 0.04}s` }} />
                  </div>
                )
              })}
            </div>
            <div className="bl">{vals.map((v, i) => <span key={i} className={v.cur ? 'cur' : ''}>{v.label}</span>)}</div>
            <span className="legend-plan"><span />previsto: attività in calendario e spese fisse</span>
          </section>

          {catRows.length > 0 && (
            <section className="in d3" aria-label="Per categoria">
              <div className="h2row"><h2>Per categoria</h2></div>
              <div className="hbars">
                {catRows.map(([id, v]) => {
                  const c = catOf(id)
                  return (
                    <div className="hb" key={id}>
                      <span className="hb-l"><CatIcon cat={c} box={24} radius={7} />{c.name}</span>
                      <span className="tr"><span className="sx" style={{ width: `${Math.round((v / top) * 100)}%`, background: (PALETTE[c.color] || PALETTE.grigio).dot }} /></span>
                      <span className="hb-v">{money(v)}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <section className="in d4" aria-label="Spese fisse">
            <div className="h2row"><h2>Spese fisse</h2><button type="button" className="link" onClick={() => openRecurring(null)}>+ Aggiungi</button></div>
            {state.recurringExpenses.length === 0 && <p className="sub small">Es. la quota del circolo: la segni una volta e ogni mese finisce qui da sola.</p>}
            {state.recurringExpenses.map((r) => (
              <button type="button" key={r.id} className="card fixed tap" onClick={() => openRecurring(r)}>
                <Icon name="rec" size={18} stroke={2.2} />
                <span className="txt"><span className="t">{r.title}</span><span className="m">Ogni mese, il giorno {r.day}</span></span>
                <span className="num md">{money(r.amount)}</span>
              </button>
            ))}
          </section>
        </div>

        <div className="col">
          <section className="in d5" aria-label="Movimenti">
            <div className="h2row"><h2>Movimenti</h2><button type="button" className="link" onClick={() => openExpense(null, { date: today })}>+ Spesa</button></div>
            {items.length === 0 && <Empty icon="spese" title="Nessuna spesa" text="Aggiungi una spesa, oppure metti un costo a un’attività." />}
            {items.map((x) => (
              <button
                type="button"
                key={x.key}
                className={'row ev' + (x.planned ? ' planned' : '')}
                style={{ gridTemplateColumns: '48px 28px 1fr auto' }}
                onClick={() => (x.source === 'manual' ? openExpense(state.expenses.find((e) => e.id === x.refId)) : x.source === 'recurring' ? openRecurring(state.recurringExpenses.find((r) => r.id === x.refId)) : openActivityById(x.refId, x.date))}
              >
                <span className="time small">{pad2(dayNum(x.date))}/{pad2(fromISO(x.date).getMonth() + 1)}</span>
                <CatIcon cat={catOf(x.categoryId)} box={28} radius={8} />
                <span className="txt">
                  <span className="t">{x.title}</span>
                  <span className="m">{catOf(x.categoryId).name}{x.source === 'activity' ? ' · da attività' : x.source === 'recurring' ? ' · fissa' : ''}{x.planned ? ' · prevista' : ''}</span>
                </span>
                <span className={'amt' + (x.planned ? ' muted' : '')}>−{money(x.amount)}</span>
              </button>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}

const pad2 = (n) => String(n).padStart(2, '0')
