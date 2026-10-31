# Quiz Builder — React + Vite Conversion

A working React + Vite conversion of the original HTML/CSS/JavaScript Quiz
Builder, built for faculty review. The original dark navy neon design, all
four mascots (jellyfish, astronaut, turtle, penguin), the Local Storage data
model and every feature of the original project are preserved.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview   # serves the dist/ build locally
```

## Demo data

Open `/test-seed` once to create the demo Creator account
(`creator@example.com` / `password`) and a demo quiz, then log in with it.
You can also simply sign up as a **Creator** — that is the Admin role of this
project, chosen at signup exactly like the original.

## Routes

| Route | Page (original) |
| --- | --- |
| `/` | Redirects to `/signup` (original root redirect) |
| `/login` | `Authentication/login.html` |
| `/signup` | `Authentication/signup.html` |
| `/role` | `Authentication/role.html` |
| `/admin/dashboard` | `Admin/dashboard.html` |
| `/admin/create` | `Admin/create.html` (`?quiz=<id>` opens Edit mode) |
| `/admin/quizzes` | `Admin/quizzes.html` |
| `/admin/results` | `Admin/creator-results.html` (`?quiz=<id>` filters) |
| `/admin/profile` | `Admin/profile.html` |
| `/user/join` | `User/join.html` |
| `/user/play` | `User/play.html` (`?quiz=<id>` = Creator Preview) |
| `/user/result` | `User/result.html` (`?attempt=<id>`) |
| `/test-seed` | `test-seed.html` |

## Project structure

```
src/
  main.jsx            entry point
  App.jsx             routes + Admin (Creator) route guard
  index.css           the original Shared/styles.css, unchanged
  components/         Topbar, Sidebar, AdminLayout
  pages/
    Authentication/   Login, Signup, Role
    Admin/            Dashboard, CreateQuiz, Quizzes, Results, Profile
    User/             Join, Play, Result
    TestSeed.jsx      demo data seeder
    NotFound.jsx      404 page
  services/
    storage.js        the original window.QBStorage as an ES module
  assets/             the four original mascot images
```

## Data compatibility

`services/storage.js` keeps the exact same Local Storage keys
(`qb.users`, `qb.session`, `qb.quizzes`, `qb.attempts`, `qb.activeAttempt`),
record shapes, password hashing, quiz codes and scoring rules as the original
`Shared/storage.js`. Data saved by the original HTML version is read and
written without any migration. No stored field was renamed.

## Deployment on Vercel (GitHub)

1. Push this folder to a GitHub repository (the included `.gitignore` excludes
   `node_modules` and `dist`).
2. In Vercel: **Add New… → Project** and import the repository.
3. Vercel auto-detects Vite. Confirm:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click **Deploy**. `vercel.json` (included) rewrites all paths to
   `index.html`, so refreshing on any route (e.g. `/admin/quizzes`) works.

## Important prototype limitation

Authentication and all data live in browser Local Storage. Accounts, quizzes
and attempts are per-browser/per-origin, and this is **not** secure
authentication — it is suitable only for a university demonstration.
Cross-device sharing would require a backend, which is intentionally not
included.
"# Quiz_Builder" 
