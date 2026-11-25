import { useState } from 'react'
import { CatIcon, Icon, Wordmark, useNow, useToast } from './components/ui.jsx'
import { useStore } from './data/store.jsx'
import { occurrencesOn } from './lib/recurrence.js'
import { todayISO } from './lib/dates.js'
import ActivitySheet from './screens/ActivitySheet.jsx'
import { ExpenseSheet, RecurringSheet } from './screens/ExpenseSheets.jsx'
import Impostazioni, { CategorySheet } from './screens/Impostazioni.jsx'
import Oggi from './screens/Oggi.jsx'
import Settimana from './screens/Settimana.jsx'
import Spese from './screens/Spese.jsx'
import Todo, { TodoSheet } from './screens/Todo.jsx'

const TABS = [
  ['oggi', 'Oggi', 'oggi'],
  ['settimana', 'Settimana', 'cal'],
  ['spese', 'Spese', 'spese'],
  ['todo', 'To-do', 'todo'],
]

export default function App() {
  const { state } = useStore()
  const now = useNow()
  const [tab, setTab] = useState('oggi')
  const [sheet, setSheet] = useState(null)
  const [toastNode, toast] = useToast()
  const [animKey, setAnimKey] = useState(0)

  function go(t) {
    if (t === tab) return
    setTab(t)
    setAnimKey((k) => k + 1)
    window.scrollTo(0, 0)
  }

  const openActivity = (occ, preset) => setSheet({ type: 'activity', occ, preset: preset || { date: todayISO(now) } })
  const openActivityById = (activityId, date) => {
    const occ = occurrencesOn(state.activities, date).find((o) => o.activityId === activityId)
    if (occ) openActivity(occ)
  }
  const close = () => setSheet(null)
  const props = {
    now,
    go,
    toast,
    openActivity,
    openActivityById,
    openSettings: () => go('impostazioni'),
    openTodo: (todo) => setSheet({ type: 'todo', todo }),
    openExpense: (expense, preset) => setSheet({ type: 'expense', expense, preset }),
    openRecurring: (item) => setSheet({ type: 'recurring', item }),
    openCategory: (category) => setSheet({ type: 'category', category }),
    back: () => go('oggi'),
  }

  return (
    <div className="shell">
      <aside className="side" aria-label="Menu">
        <Wordmark size={26} />
        <nav className="side-nav" aria-label="Sezioni">
          {TABS.map(([k, l, ic]) => (
            <button type="button" key={k} className={tab === k ? 'on' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>
              <Icon name={ic} size={20} />
              {l}
            </button>
          ))}
          <button type="button" className={tab === 'impostazioni' ? 'on' : ''} aria-current={tab === 'impostazioni' ? 'page' : undefined} onClick={() => go('impostazioni')}>
            <Icon name="gear" size={20} />
            Impostazioni
          </button>
        </nav>
        <button type="button" className="primary side-add" onClick={() => openActivity(null)}>
          <Icon name="plus" size={18} stroke={2.6} /> Nuova attività
        </button>
        <div className="side-cats">
          <span className="lbl">Categorie</span>
          {state.categories.map((c) => (
            <button type="button" key={c.id} onClick={() => props.openCategory(c)}>
              <CatIcon cat={c} box={24} radius={7} />
              {c.name}
            </button>
          ))}
        </div>
      </aside>

      <main className="main anim" key={animKey}>
        {tab === 'oggi' && <Oggi {...props} />}
        {tab === 'settimana' && <Settimana {...props} />}
        {tab === 'spese' && <Spese {...props} />}
        {tab === 'todo' && <Todo {...props} />}
        {tab === 'impostazioni' && <Impostazioni {...props} />}
      </main>

      <div className="nav">
        <nav aria-label="Sezioni">
          {TABS.map(([k, l, ic]) => (
            <button type="button" key={k} className={tab === k ? 'on' : ''} aria-label={l} aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>
              <Icon name={ic} size={tab === k ? 20 : 22} />
              {tab === k && <span>{l}</span>}
            </button>
          ))}
        </nav>
        <button type="button" className="fab tap" aria-label="Nuova attività" onClick={() => openActivity(null)}>
          <Icon name="plus" size={24} stroke={2.6} />
        </button>
      </div>

      {sheet?.type === 'activity' && <ActivitySheet occ={sheet.occ} preset={sheet.preset} onClose={close} toast={toast} onManageCategories={() => { close(); go('impostazioni') }} />}
      {sheet?.type === 'todo' && <TodoSheet todo={sheet.todo} onClose={close} toast={toast} />}
      {sheet?.type === 'expense' && <ExpenseSheet expense={sheet.expense} preset={sheet.preset} onClose={close} toast={toast} />}
      {sheet?.type === 'recurring' && <RecurringSheet item={sheet.item} onClose={close} toast={toast} />}
      {sheet?.type === 'category' && <CategorySheet category={sheet.category} onClose={close} toast={toast} />}
      {toastNode}
    </div>
  )
}
