````markdown
## 1. How to run

This project requires **Node.js v18+** installed on your machine. No other system dependencies (like Docker, `jq`, or external databases) are needed.

### macOS / Linux

Open your terminal in the project root and run:

```bash
chmod +x run.sh
./run.sh
```
````

### Windows

Open **Git Bash** (included with Git for Windows) in the project root and run:

```bash
./run.sh
```

> **Note:** The interactive CLI wrapper (`run.sh`) is designed for Unix-like shells. Windows users must use Git Bash or WSL2 to run the script. Running `npm start` directly in PowerShell/CMD will boot the API server on `http://localhost:3000`, but the interactive terminal menu will not be available.

The script automatically installs npm dependencies, initializes a local SQLite database (`data/database.sqlite`), starts the Express API in the background, and launches the interactive CLI. When you exit, the script gracefully kills the background server. All data persists between restarts.

## 2. Stack choice

**Choice:** Node.js, Express, TypeScript, and SQLite (`better-sqlite3`), wrapped in a Bash CLI.

**Why:** The assessment requires persistence on a "fresh machine." SQLite provides ACID-compliant relational persistence without requiring the reviewer to install a database daemon, configure Docker, or manage environment variables. Separating the Express app (`app.ts`) from the server listener (`index.ts`) enforces clean MVC architecture and allows the app to be imported into test frameworks without spinning up a live server. The Bash wrapper uses inline Node helpers for JSON formatting, guaranteeing the CLI works natively on any Unix-compatible shell without external tools like `jq`.

**Worse Choice:** Using MongoDB or a hosted cloud database (e.g., Supabase/Firebase). MongoDB would force the reviewer to install and run the Mongo daemon locally just to test a simple scheduling algorithm. A hosted DB would require managing API keys and network requests, violating the offline/fresh-machine spirit of this assessment.

## 3. One real edge case

**Edge Case:** The SM-2 Easiness Factor (EF) Mathematical Floor
**Location:** `src/models/sm2.ts`, line 17

**Explanation:** The SM-2 spaced repetition algorithm adjusts a card's "Easiness Factor" based on user recall quality. If a user repeatedly fails a card (submitting low scores like 0 or 1), the mathematical formula will eventually drive the EF below `1.0`. Without handling, an EF below 1.0 breaks the interval multiplier (`interval * EF`), resulting in negative or zero-day intervals. This corrupts the scheduling queue and causes SQL date-parsing errors when calculating the next due date.

**Handling:** I added a strict boundary check: `if (easiness_factor < 1.3) easiness_factor = 1.3;`. This ensures the algorithm remains mathematically stable even for cards a user consistently struggles with, preventing infinite review loops or backend crashes.

## 4. AI usage

**Tool:** Antigravity

AI was used as an orchestrator for boilerplate generation and shell scripting, while all core business logic, architecture decisions, and algorithm implementations were manually coded and thoroughly reviewed.

- **Boilerplate Scaffolding:** Asked Antigravity to generate the standard Express MVC folder structure and basic CRUD route templates.
  - _What I changed:_ Antigravity generated a monolithic `server.ts` file combining middleware, routes, and the HTTP listener. I manually refactored this into separate `app.ts` (Express configuration) and `index.ts` (server binding) files. I made this change because separating concerns is an industry best practice that allows the Express app to be imported into testing frameworks later without accidentally spinning up a live server. All generated boilerplate was reviewed line-by-line for security and correctness before integration.
- **Bash CLI Scripting:** Asked Antigravity to generate the majority of the `run.sh` interactive CLI wrapper, including the menu loop, `curl` commands, and process lifecycle management.
  - _What I changed:_ Antigravity’s initial script relied on `jq` for JSON formatting, which would break on fresh machines without it installed. I replaced all `jq` calls with inline `node -e` helper functions (`make_json` and `format_json`) to guarantee zero external dependencies. I also added the `trap cleanup` handler to prevent zombie processes, which the AI output initially omitted. The final script was manually tested in linux (should also work on Mac and Windows).
- **SM-2 Algorithm Reference:** Asked Antigravity to explain the SM-2 spaced repetition formula and provide a reference TypeScript implementation.
  - _What I changed:_ Antigravity’s initial implementation used JavaScript’s native `Date()` and local timezone methods to calculate the next review date. I rewrote this entirely to strictly use UTC ISO strings (`nextDueDate.toISOString()`) and UTC date math. Native `Date()` relies on the host machine's local timezone; if the reviewer's machine is in a different timezone, a card due "today" could incorrectly shift to "tomorrow" due to offset math. Forcing UTC prevents timezone drift in the scheduling queue. The final algorithm was manually validated against the original SM-2 research paper.

## 5. Honest gap

**Gap:** The application is currently CLI/API-only and lacks a frontend interface.

**Explanation:** While the Bash CLI wrapper demonstrates headless system design and HTTP protocol understanding, it is not accessible to non-technical users. A flashcard app is inherently visual, and reviewing cards via terminal commands creates unnecessary friction. The SM-2 algorithm and review queue are fully functional, but the user experience is limited by the text-only interface.

**Fix:** With another day, I would build a lightweight React or Svelte frontend that consumes the existing Express API. The frontend would display flashcards in a proper card UI with flip animations, visual progress bars for streaks, and color-coded feedback for review scores. The existing REST API is already fully decoupled and ready to serve a frontend without any backend modifications, which validates the decision to separate `app.ts` from `index.ts` and enforce strict MVC architecture from the start.

```

```
