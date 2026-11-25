import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { deleteOccurrence, editOccurrence, newId } from '../lib/recurrence.js'
import { migrate, repo } from './repo.js'
import { seedState } from './seed.js'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, setState] = useState(null)
  const loaded = useRef(false)

  useEffect(() => {
    repo.load().then((data) => {
      setState(data || seedState())
      loaded.current = true
    })
  }, [])

  // salva a ogni modifica (con un piccolo ritardo)
  useEffect(() => {
    if (!loaded.current || !state) return
    const t = setTimeout(() => repo.save(state), 150)
    return () => clearTimeout(t)
  }, [state])

  const update = useCallback((fn) => setState((s) => fn(s)), [])

  const actions = useMemo(
    () => ({
      // attività
      addActivity: (form) => update((s) => ({ ...s, activities: [...s.activities, { ...form, id: newId('act'), exceptions: {} }] })),
      editOccurrence: (occ, form, scope) => update((s) => ({ ...s, activities: editOccurrence(s.activities, occ.activityId, occ.date, form, scope) })),
      deleteOccurrence: (occ, scope) => update((s) => ({ ...s, activities: deleteOccurrence(s.activities, occ.activityId, occ.date, scope) })),

      // to-do
      addTodo: (todo) => update((s) => ({ ...s, todos: [{ id: newId('todo'), done: false, due: null, ...todo, createdAt: Date.now() }, ...s.todos] })),
      toggleTodo: (id) => update((s) => ({ ...s, todos: s.todos.map((t) => (t.id === id ? { ...t, done: !t.done, doneAt: t.done ? null : Date.now() } : t)) })),
      updateTodo: (id, patch) => update((s) => ({ ...s, todos: s.todos.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      removeTodo: (id) => update((s) => ({ ...s, todos: s.todos.filter((t) => t.id !== id) })),
      clearDoneTodos: () => update((s) => ({ ...s, todos: s.todos.filter((t) => !t.done) })),

      // spese
      addExpense: (e) => update((s) => ({ ...s, expenses: [...s.expenses, { ...e, id: newId('exp') }] })),
      updateExpense: (id, patch) => update((s) => ({ ...s, expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeExpense: (id) => update((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) })),
      addRecurringExpense: (r) => update((s) => ({ ...s, recurringExpenses: [...s.recurringExpenses, { ...r, id: newId('rec') }] })),
      updateRecurringExpense: (id, patch) => update((s) => ({ ...s, recurringExpenses: s.recurringExpenses.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      removeRecurringExpense: (id) => update((s) => ({ ...s, recurringExpenses: s.recurringExpenses.filter((r) => r.id !== id) })),

      // categorie
      saveCategory: (cat) =>
        update((s) => {
          const exists = s.categories.some((c) => c.id === cat.id)
          return { ...s, categories: exists ? s.categories.map((c) => (c.id === cat.id ? { ...c, ...cat } : c)) : [...s.categories, { ...cat, id: cat.id || newId('cat') }] }
        }),
      removeCategory: (id) => update((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) })),

      // impostazioni e dati
      updateSettings: (patch) => update((s) => ({ ...s, settings: { ...s.settings, ...patch } })),
      importData: (data) => {
        const m = migrate(data)
        if (!m || !Array.isArray(m.categories) || !m.categories.length) return false
        setState(m)
        return true
      },
      resetData: () => setState(seedState()),
    }),
    [update],
  )

  if (!state) return null
  return <StoreContext.Provider value={{ state, ...actions }}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}

export function useCategory() {
  const { state } = useStore()
  return useCallback(
    (id) => state.categories.find((c) => c.id === id) || { id, name: 'Senza categoria', icon: 'stella', color: 'grigio' },
    [state.categories],
  )
}

/** Uso di una categoria: quante attività, to-do e spese la usano */
export function categoryUsage(state, id) {
  return (
    state.activities.filter((a) => a.categoryId === id || Object.values(a.exceptions || {}).some((e) => e.override && e.override.categoryId === id)).length +
    state.expenses.filter((e) => e.categoryId === id).length +
    state.recurringExpenses.filter((e) => e.categoryId === id).length
  )
}
