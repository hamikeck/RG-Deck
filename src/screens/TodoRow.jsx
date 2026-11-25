import { Icon } from '../components/ui.jsx'
import { relativeDay, shortDate } from '../lib/dates.js'

export default function TodoRow({ t, today, onToggle, onEdit }) {
  const overdue = !t.done && t.due && t.due < today
  const dueLabel = t.due ? (Math.abs(daysDiff(today, t.due)) <= 1 ? relativeDay(today, t.due) : shortDate(t.due)) : null
  return (
    <div className={'todo' + (t.done ? ' on' : '')}>
      <button type="button" className="bx-btn" aria-pressed={t.done} aria-label={(t.done ? 'Segna da fare: ' : 'Fatto: ') + t.text} onClick={onToggle}>
        <span className="bx">{t.done && <Icon name="check" size={13} stroke={2.6} />}</span>
      </button>
      <button type="button" className="todo-txt" onClick={onEdit}>
        <span className="lb">{t.text}</span>
        {dueLabel && <span className={'tg' + (overdue ? ' late' : '')}>{overdue ? 'in ritardo · ' : ''}{dueLabel}</span>}
      </button>
    </div>
  )
}

function daysDiff(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}
