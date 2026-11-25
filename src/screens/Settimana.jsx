import { useState } from 'react'
import { CatIcon, Empty, Icon, Wordmark } from '../components/ui.jsx'
import { useCategory, useStore } from '../data/store.jsx'
import { ICONS, PALETTE, kindLabel } from '../lib/catalog.js'
import { DAY_ABBR, DAY_SHORT, addDays, dayNum, isoWeekNumber, longDay, nowMin, startOfWeek, toMin, todayISO, weekDays, weekRangeLabel } from '../lib/dates.js'
import { occurrencesOn } from '../lib/recurrence.js'
import { useIsDesktop } from './useIsDesktop.js'

export default function Settimana({ now, openActivity, openSettings }) {
  const { state } = useStore()
  const catOf = useCategory()
  const desktop = useIsDesktop()
  const today = todayISO(now)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))
  const [sel, setSel] = useState(today)
  const days = weekDays(weekStart)
  const byDay = days.map((d) => occurrencesOn(state.activities, d))
  const all = byDay.flat()

  const startH = Math.min(8, ...all.map((o) => Math.floor(toMin(o.start) / 60)))
  const endH = Math.max(22, ...all.map((o) => Math.ceil(toMin(o.end) / 60)))
  const ROW = desktop ? 44 : 26
  const height = (endH - startH) * ROW
  const minute = nowMin(now)
  const nowTop = ((minute - startH * 60) / 60) * ROW

  const selected = days.includes(sel) ? sel : days[0]
  const selOcc = byDay[days.indexOf(selected)]
  const usedCats = state.categories.filter((c) => all.some((o) => o.categoryId === c.id))

  function moveWeek(n) {
    const ws = addDays(weekStart, n * 7)
    setWeekStart(ws)
    setSel(ws <= today && today <= addDays(ws, 6) ? today : ws)
  }

  const hours = []
  for (let h = startH; h <= endH; h += 2) hours.push(h)

  return (
    <div className="scr sett">
      <div className="hd in d1">
        <Wordmark />
        <span className="hd-right">
          <span className="sub small strong">Sett. {isoWeekNumber(weekStart)}</span>
          <button type="button" className="icon-btn only-mobile" aria-label="Impostazioni" onClick={openSettings}><Icon name="gear" size={20} /></button>
        </span>
      </div>

      <div className="in d1 week-head">
        <h1 className="big">{weekRangeLabel(weekStart)}</h1>
        <div className="week-nav">
          {weekStart !== startOfWeek(today) && <button type="button" className="pill small" onClick={() => { setWeekStart(startOfWeek(today)); setSel(today) }}>Oggi</button>}
          <button type="button" className="round-btn" aria-label="Settimana precedente" onClick={() => moveWeek(-1)}><Icon name="left" size={16} stroke={2.2} /></button>
          <button type="button" className="round-btn" aria-label="Settimana successiva" onClick={() => moveWeek(1)}><Icon name="right" size={16} stroke={2.2} /></button>
        </div>
      </div>

      <div className="days in d2">
        <span />
        {days.map((d, i) => (
          <button type="button" key={d} className={'dbtn' + (d === today ? ' today' : '') + (d === selected ? ' sel' : '')} aria-pressed={d === selected} aria-label={longDay(d)} onClick={() => setSel(d)}>
            <span>{desktop ? DAY_ABBR[i] : DAY_SHORT[i]}</span>
            <span>{dayNum(d)}</span>
          </button>
        ))}
      </div>

      <section className="in d2 grid-wrap" aria-label="Griglia della settimana">
        <div className="grid">
          <div className="hcol" style={{ height }}>
            {hours.map((h) => <span key={h} style={{ top: (h - startH) * ROW - 6 }}>{desktop ? `${h}:00` : h}</span>)}
          </div>
          {days.map((d, di) => (
            <div key={d} className={'dcol' + (d === selected ? ' sel' : '')} style={{ height, backgroundSize: `100% ${ROW * 2}px` }} onClick={() => setSel(d)}>
              {byDay[di].map((o, bi) => {
                const c = catOf(o.categoryId)
                const p = PALETTE[c.color] || PALETTE.grigio
                const top = ((toMin(o.start) - startH * 60) / 60) * ROW + 1
                const h = Math.max(((toMin(o.end) - toMin(o.start)) / 60) * ROW - 2, 18)
                return (
                  <button
                    type="button"
                    key={o.key}
                    className="blkx blk"
                    title={`${o.title} · ${o.start}–${o.end}`}
                    aria-label={`${o.title}, ${longDay(d)} ${o.start}–${o.end}`}
                    style={{ top, height: h, background: p.bg, color: p.ink, animationDelay: `${0.12 + di * 0.04 + bi * 0.02}s` }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (desktop) openActivity(o)
                      else setSel(d)
                    }}
                  >
                    <svg width={desktop ? 13 : 14} height={desktop ? 13 : 14} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[c.icon] || ICONS.stella} /></svg>
                    {desktop && h > 30 && <span className="blk-t">{o.title}</span>}
                  </button>
                )
              })}
              {d === today && minute >= startH * 60 && minute <= endH * 60 && (
                <>
                  <span className="nowline" style={{ top: nowTop }} />
                  <span className="nowdot" style={{ top: nowTop - 3 }} />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="legend">
          {(usedCats.length ? usedCats : state.categories).map((c) => (
            <span key={c.id}><CatIcon cat={c} box={20} radius={6} />{c.name}</span>
          ))}
        </div>
      </section>

      <section className="in d3 day-detail" aria-label={longDay(selected)}>
        <div className="h2row">
          <h2>{longDay(selected)}</h2>
          <button type="button" className="link" onClick={() => openActivity(null, { date: selected })}>+ Aggiungi</button>
        </div>
        {selOcc.length === 0 && <Empty icon="cal" title="Niente in programma" />}
        {selOcc.map((o) => (
          <button type="button" key={o.key} className={'row ev' + (o.date < today || (o.date === today && toMin(o.end) <= minute) ? ' past' : '')} onClick={() => openActivity(o)} style={{ gridTemplateColumns: '92px 30px 1fr auto' }}>
            <span className="time">{o.start}–{o.end}</span>
            <CatIcon cat={catOf(o.categoryId)} box={30} radius={9} />
            <span className="txt">
              <span className="t">{o.title}</span>
              <span className="m">{[o.kind && kindLabel(o.kind), o.recurring && 'ogni settimana', o.notes].filter(Boolean).join(' · ') || catOf(o.categoryId).name}</span>
            </span>
            <span className="muted strong">{o.cost && o.cost.amount ? `€${o.cost.amount}` : ''}</span>
          </button>
        ))}
      </section>
    </div>
  )
}
