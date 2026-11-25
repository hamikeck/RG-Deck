import { CatIcon, Empty, Icon, Wordmark } from '../components/ui.jsx'
import { useCategory, useStore } from '../data/store.jsx'
import { kindLabel } from '../lib/catalog.js'
import { DAY_NAME, dayNum, durationLabel, nowMin, relativeDay, toMin, todayISO, weekday } from '../lib/dates.js'
import { occurrencesOn } from '../lib/recurrence.js'
import { money, weekStats } from '../lib/stats.js'
import TodoRow from './TodoRow.jsx'

export default function Oggi({ now, go, openActivity, openSettings, openTodo }) {
  const { state, toggleTodo } = useStore()
  const catOf = useCategory()
  const today = todayISO(now)
  const minute = nowMin(now)
  const occ = occurrencesOn(state.activities, today)
  const current = occ.find((o) => toMin(o.start) <= minute && toMin(o.end) > minute)
  const next = occ.find((o) => toMin(o.start) > minute)
  const st = weekStats(state, today, minute)
  const todosToday = state.todos.filter((t) => !t.done && t.due && t.due <= today)
  const todosShown = todosToday.length ? todosToday : state.todos.filter((t) => !t.done).slice(0, 3)

  const subtitle = occ.length
    ? `${occ.length} ${occ.length === 1 ? 'impegno' : 'impegni'}${next ? ` · poi ${next.title.toLowerCase()} alle ${next.start}` : ''}`
    : 'Nessun impegno in calendario'

  return (
    <div className="scr oggi">
      <div className="hd in d1">
        <Wordmark />
        <button type="button" className="icon-btn" aria-label="Impostazioni" onClick={openSettings}><Icon name="gear" size={20} /></button>
      </div>

      <div className="in d1 title-block">
        <h1 className="big">
          {DAY_NAME[weekday(today)]} <span className="mark"><i className="sx" /><b>{dayNum(today)}</b></span>
        </h1>
        <span className="sub">Ciao {state.settings.name} · {subtitle}</span>
      </div>

      <div className="oggi-grid">
        <div className="col">
          <NowCard occ={current || next} isNow={!!current} minute={minute} catOf={catOf} onOpen={openActivity} onAdd={() => openActivity(null, { date: today })} />

          <section className="wg in d3" aria-label="Questa settimana">
            <button type="button" className="w tap" onClick={() => go('settimana')}>
              <svg className="court" width="150" height="120" viewBox="0 0 150 120" aria-hidden="true" fill="none" stroke="#1F3F8F" strokeWidth="1.5"><rect x="5" y="5" width="140" height="110" /><path d="M25 5v110M125 5v110M25 40h100M25 80h100M75 40v40M5 60h140" /></svg>
              <span className="lb"><CatIcon cat={catOf('tennis')} box={30} radius={9} />Tennis</span>
              <span className="vv"><span className="num">{st.tennis.done}/{st.tennis.total}</span><small>{st.tennis.nextToday ? `oggi ${st.tennis.nextToday.start}` : 'questa sett.'}</small></span>
            </button>
            <button type="button" className="w tap" onClick={() => go('settimana')}>
              <span className="lb"><CatIcon cat={catOf('studio')} box={30} radius={9} />Studio</span>
              <span className="vv"><span className="num">{st.study.days}/{st.study.goal}</span><small>giorni</small></span>
              <span className="segbar" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${st.study.goal}, minmax(0,1fr))` }}>
                {Array.from({ length: st.study.goal }, (_, i) => <span key={i} className={i < st.study.days ? 'on sx' : ''} />)}
              </span>
            </button>
            <button type="button" className="w tap short" onClick={() => go('settimana')}>
              <span className="lb"><CatIcon cat={catOf('scuola')} box={30} radius={9} />Verifiche</span>
              <span className="vv"><span className="num">{st.tests.count}</span><small>{st.tests.next ? `${kindLabel(st.tests.next.kind).toLowerCase()} ${relativeDay(today, st.tests.next.date)}` : 'nessuna in vista'}</small></span>
            </button>
            <button type="button" className="w tap short" onClick={() => go('spese')}>
              <span className="lb"><CatIcon cat={catOf('acquisti')} box={30} radius={9} />Spese</span>
              <span className="vv"><span className="num">{money(st.spend)}</span><small>questa sett.</small></span>
            </button>
          </section>
        </div>

        <div className="col">
          <section className="in d4" aria-label="Programma di oggi">
            <div className="h2row"><h2>Programma</h2><button type="button" className="link" onClick={() => go('settimana')}>Settimana →</button></div>
            {occ.length === 0 && <Empty icon="cal" title="Giornata libera" text="Aggiungi qualcosa con il +" />}
            {occ.map((o) => {
              const past = toMin(o.end) <= minute
              const isNow = o === current
              return (
                <button type="button" key={o.key} className={'row ev' + (past ? ' past' : '')} onClick={() => openActivity(o)}>
                  <span className="time">{o.start}</span>
                  <span className={isNow ? 'ring' : ''}><CatIcon cat={catOf(o.categoryId)} box={30} radius={9} /></span>
                  <span className="txt">
                    <span className="t">{o.title}</span>
                    <span className="m">{[o.kind && kindLabel(o.kind), `fino alle ${o.end}`, o.notes].filter(Boolean).join(' · ')}</span>
                  </span>
                  <span className="muted">{o.recurring && <Icon name="rec" size={15} stroke={2.2} />}</span>
                </button>
              )
            })}
          </section>

          <section className="in d5" aria-label="Da fare">
            <div className="h2row"><h2>Da fare</h2><button type="button" className="link" onClick={() => go('todo')}>Tutti →</button></div>
            {todosShown.length === 0 && <Empty icon="todo" title="Niente da fare" text="Aggiungi le cose piccole da ricordare in To-do" />}
            {todosShown.map((t) => <TodoRow key={t.id} t={t} today={today} onToggle={() => toggleTodo(t.id)} onEdit={() => openTodo(t)} />)}
          </section>
        </div>
      </div>
    </div>
  )
}

function NowCard({ occ, isNow, minute, catOf, onOpen, onAdd }) {
  if (!occ) {
    return (
      <section className="card in d2 now-card" aria-label="Adesso">
        <span className="now-lbl"><span className="dotlive" />Adesso</span>
        <span className="now-title">Tempo libero</span>
        <span className="sub small">Niente altro in programma oggi.</span>
        <button type="button" className="link" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={onAdd}>+ Aggiungi qualcosa</button>
      </section>
    )
  }
  const s = toMin(occ.start)
  const e = toMin(occ.end)
  const pct = isNow ? Math.round(((minute - s) / (e - s)) * 100) : 0
  return (
    <button type="button" className="card in d2 now-card tap" onClick={() => onOpen(occ)} aria-label={(isNow ? 'Adesso: ' : 'Prossimo: ') + occ.title}>
      <span className="row-between">
        <span className="now-lbl">{isNow ? <span className="dotlive pulse" /> : <CatIcon cat={catOf(occ.categoryId)} box={20} radius={6} />}{isNow ? 'Adesso' : 'Prossimo'}</span>
        <span className="sub small">{isNow ? `ancora ${durationLabel(e - minute)}` : `tra ${durationLabel(s - minute)}`}</span>
      </span>
      <span className="now-title">{occ.title}</span>
      <span className="sub small">{occ.start}–{occ.end}{occ.notes ? ` · ${occ.notes}` : ''}</span>
      {isNow && <span className="bar"><span className="sx" style={{ width: `${pct}%` }} /></span>}
    </button>
  )
}

