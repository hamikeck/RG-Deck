# R.G DECK

La dashboard personale di Raffaele: scuola, tennis, tempo libero, spese e cose da fare.
È una PWA: si installa sull'iPhone da Safari (Condividi → Aggiungi alla schermata Home) e funziona anche da computer.

## Avviare il progetto

```bash
npm install
npm run dev      # sviluppo su http://localhost:5173
npm test         # test della logica (ricorrenze, spese, statistiche)
npm run build    # build di produzione in dist/
```

Stack: React 19 + Vite, `vite-plugin-pwa` per manifest e service worker, Vitest per i test. Nessuna libreria di UI: il CSS è tutto in `src/styles.css`.

## Struttura

```
src/
  App.jsx                 navigazione (barra in basso sul telefono, barra laterale da 960px in su) e fogli
  data/
    seed.js               dati iniziali: categorie, scuola (provvisoria), tennis, British
    repo.js               dove si salvano i dati (oggi localStorage, domani Supabase)
    store.jsx             stato dell'app e azioni (aggiungi, modifica, elimina…)
  lib/
    recurrence.js         attività ricorrenti: "solo questa volta", "questa e le prossime", "tutte"
    stats.js              numeri dei widget e spese di un periodo
    dates.js              date in ora locale (lunedì = 0)
    catalog.js            icone e colori (palette leggibile anche per chi è daltonico)
  screens/                Oggi, Settimana, Spese, To-do, Impostazioni e i fogli di modifica
  components/ui.jsx       pezzi comuni (icone, foglio, interruttori…)
```

## Come funzionano le attività

Ogni attività ha un giorno, un orario e può ripetersi ogni settimana (in uno o più giorni) o ogni mese.
Quando si modifica o si elimina un'attività che si ripete, l'app chiede:

- **solo questa volta** → crea un'eccezione per quel giorno (es. allenamento spostato alle 17:00)
- **questa e le prossime** → chiude la serie il giorno prima e ne inizia una nuova
- **tutte** → cambia l'intera serie

Le categorie (nome, icona, colore) sono modificabili da Impostazioni. Il colore è solo un aiuto: ogni categoria si riconosce dall'icona.

## Dati

Per ora i dati restano nel browser del dispositivo (`localStorage`). In Impostazioni ci sono **Scarica backup** e **Ripristina**.

### Passare a Supabase (sincronizzazione iPhone ↔ computer)

`src/data/repo.js` espone un oggetto con due metodi, `load()` e `save(state)`. Per sincronizzare basta:

1. creare un progetto su supabase.com e una tabella `decks (user_id uuid primary key, data jsonb, updated_at timestamptz)` con Row Level Security ("ognuno vede solo la sua riga");
2. aggiungere il login via email (magic link);
3. scrivere un `supabaseRepo` con gli stessi `load`/`save` e cambiare l'ultima riga di `repo.js`.

Il resto dell'app non cambia.
