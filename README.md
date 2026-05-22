# Lembas CLI 🧝

Lembas is a Terminal-based Spaced Repetition flashcard application utilizing the robust SuperMemo 2 (SM-2) algorithm. The backend is built on **Node.js, Express, and SQLite**, fully typed with **TypeScript**.

The primary way to interact with the application is through **Lembas**, a fully interactive Bash-based UI that manages background server lifecycles while allowing you to manage your decks and review flashcards right from your terminal without writing manual HTTP requests.

## Tech Stack

- **Runtime**: Node.js & node-tsx
- **Backend**: Express & TypeScript
- **Database**: better-sqlite3 (SQLite running in WAL mode with Cascade support)
- **Algorithm**: Standard SM-2 Spaced Repetition System
- **Client**: Interactive Bash scripting using standard UNIX tooling (`curl` & Node inline scripts)

---

## 🚀 Setup & Installation

### Prerequisites

Make sure you have installed on your local machine:

- Node.js (v18+)
- npm
- Git

### 1. Clone & Install

```bash
git clone https://github.com/amh1k/lembas.git
cd lembas
npm install
```

---

## 💻 Running the App (Cross-Platform Guide)

The Lembas client is a Bash script (`run.sh`). The script automatically starts the Node.js API server in the background, waits for SQLite to mount, launches the interactive UI session, and gracefully kills the server when you exit.

### Linux & macOS

Bash is natively built into Linux and Apple environments.

```bash
# Provide execution rights to the bash script (only needed once)
chmod +x run.sh

# Run the cli and enjoy!
./run.sh
```

### Windows

Windows does not execute Bash (`.sh`) scripts natively in PowerShell or Command Prompt. You have three primary ways to run Lembas on Windows:

**Option A: Git Bash (Recommended, easiest)**
If you installed Git for Windows, you already have Git Bash!

1. Right-click inside the project folder and select **"Open Git Bash here"**.
2. Run standard Linux execution commands:

```bash
./run.sh
```

**Option B: WSL (Windows Subsystem for Linux)**
If you are running WSL 2 (Ubuntu, etc.):

1. Open your WSL terminal.
2. Ensure you've ran `npm install` from inside WSL (do not share `node_modules` between Windows and WSL natively).
3. Run `chmod +x run.sh` and `./run.sh`.

**Option C: Manual API Server**
If you prefer not to use the terminal UI or are testing the REST API via Postman/Insomnia:

1. Open PowerShell / Command Prompt.
2. Run `npm run dev` to start the development server via tsx.
3. Keep this terminal open! The server is running natively on `localhost:3000`.

---

## 🧠 Using Lembas

When you execute `./run.sh`, you will be greeted with the interactive menu:

1. **📚 Create a new Deck**: Creates a new category for your flashcards (e.g., "Spanish Vocab", "Algorithms").
2. **📖 View all Decks**: Retrieves your deck IDs (needed for adding cards).
3. **📝 Add a Card to a Deck**: Creates a flashcard. It will ask for the Deck ID, the Front (question), and the Back (answer).
4. **⏳ Get Due Cards**: Queries the SM-2 algorithm to fetch cards whose `due_date` has elapsed.
5. **🧠 Review a Card**: This executes the SM-2 learning logic. It will ask for the Card ID and a **Quality Score (0 - 5)**:
   - `0-2`: Failed (Forgot the answer). Will reset repetitions and interval to 1 day.
   - `3`: Passed, but it was difficult.
   - `4`: Passed with hesitation.
   - `5`: Perfect recall.
     _The interval, repetitions, and easiness factor will multiply and extend the time until you next see the card._
6. **🚪 Exit**: Closes the application and immediately shuts down the background Node process.

---

## 🏗️ Architecture Details

- `/run.sh`: Client UI Loop, JSON formatting scripts, and Process Lifecycle Management.
- `src/app.ts`: Wires together standard backend mechanics including `cors` and the router.
- `src/config/db.ts`: Handles the robust SQLite initialization and foreign key cascading rules.
- `src/models/cardModel.ts`: Holds data access boundaries and query preparation.
- `src/services/sm2.ts`: Contains pure algorithm logic for calculating Next Due Dates depending on quality ratings.
