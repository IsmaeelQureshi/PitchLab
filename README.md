# ⚽ PitchLab

*An interactive soccer analytics dashboard with shot maps, expected goals, and chance-based outcome probabilities*

🔗 **Live Demo:** [Hosted on Vercel](https://pitch-lab-nu.vercel.app/)

PitchLab lets you browse matches from StatsBomb Open Data, inspect shots on an interactive pitch, and explore the chances behind the score. Choose a competition, season, and match, then click **Analyze match** to see the results.

The dashboard uses **StatsBomb’s supplied expected-goals (xG) values**, not a model trained by PitchLab. Outcome probabilities describe what could happen if the selected chances were repeated; they are **not predictions of future matches**.

---

## 🚀 Features

- Browse available competitions, seasons, and matches from StatsBomb Open Data
- Explore an interactive, keyboard-accessible shot map with player details and an event log
- Filter shots by team and minute, with matching score, xG, and probability updates
- Calculate exact home-win, draw, and away-win probabilities under an independent-shot assumption
- Import and export shot datasets as JSON, preserving supplied xG values
- Retry failed match downloads while keeping the current analysis intact
- Start with a bundled Argentina–France 2022 World Cup final dataset: 30 shots and a 3–3 score, excluding the shootout

## 🛠 Tech Stack

| Component | Technologies |
| --------- | ------------ |
| Interface | JavaScript ES modules, HTML, CSS, SVG |
| Analytics | JavaScript, Poisson-binomial dynamic programming |
| Match data | StatsBomb Open Data, JSON |
| Local server | Node.js HTTP server |
| Hosting configuration | Vercel, static site |
| Tests | Node.js test runner, GitHub Actions |

## 🖥 Run Locally

Install **Node.js 20 or later**, then run:

```sh
git clone https://github.com/IsmaeelQureshi/PitchLab.git
cd PitchLab
npm start
```

Open [**http://127.0.0.1:4173**](http://127.0.0.1:4173). Press **Ctrl+C** to stop the server. No `npm install` is needed because the project has no external npm dependencies.

Serve the app over HTTP; opening `dist/index.html` directly will not load its JavaScript modules correctly.

## 🌐 Deploy to Vercel

Import the repository with these settings:

| Setting | Value |
| ------- | ----- |
| Root Directory | Project root |
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `dist` |

The included `vercel.json` configures the build command and output directory. The build runs syntax checks and tests before deployment. No environment variables, API keys, database setup, or backend service are required.

Match browsing fetches public JSON from StatsBomb’s GitHub repository and requires internet access. Coverage is limited to the matches published in the open dataset. The bundled World Cup final can be analyzed without internet access when the app is served locally.

Selected matches and imports stay in browser memory. Reloading restores the bundled match; there is no saved history. After deployment, check match loading, filters, and JSON export/import at the deployed URL.

## 📊 How the Analysis Works

Each shot has a scoring probability given by its xG. PitchLab builds a goal-count distribution for each team using Poisson-binomial dynamic programming, then combines the distributions to calculate win, draw, and loss probabilities.

This calculation is exact **under the assumption that shots are independent**. Rebounds and game-state effects can violate that assumption. The score, metrics, and probabilities reflect the currently selected shots, which may represent only part of a match.

Shots without supplied xG use an educational distance, angle, and body-part heuristic. Its coefficients are hand-selected, not trained or calibrated.

Extra-time shots and in-match penalties are included. Penalty shootouts are excluded. Both teams’ shots are displayed attacking toward the right-hand goal.

## 📥 Import and Export

Import a JSON array of up to **5,000 shots** in a file no larger than **2 MB**:

```json
[
  {
    "x": 96,
    "y": 35,
    "minute": 21,
    "team": "home",
    "player": "A. Morgan",
    "bodyPart": "foot",
    "goal": true,
    "xg": 0.35
  }
]
```

Coordinates use a 105 × 68 meter pitch, with every shot attacking toward `(105, 34)`. Required fields are `x`, `y`, `minute`, `team`, `player`, `bodyPart`, and `goal`. Teams must be `home` or `away`; body parts must be `foot`, `head`, or `other`; minutes must be between 0 and 130. Optional `xg` must be between 0 and 1.

Imported datasets use **Home/Away** team labels. Invalid imports preserve the current analysis, and **Reset filters** keeps the active dataset. **Export JSON** exports the entire active shot dataset, including shots hidden by filters. Imports are processed locally in the browser.

## 📁 Project Structure

```text
dist/
  index.html              Dashboard interface
  style.css               Responsive styles
  app.js                  Application state and rendering
  analytics.js            xG, validation, and outcome probabilities
  match-browser.js        Competition, season, and match loading
  statsbomb.js            StatsBomb event conversion
  match-data.js           Bundled World Cup final snapshot
  export.js               JSON download helper
  demo.js                 Synthetic test fixture
  statsbomb-logo.png      Data-provider attribution
  statsbomb-license.pdf   Original data license
scripts/
  fetch-data.mjs          Refresh the bundled snapshot
  statsbomb-adapter.mjs   Shared adapter re-export
tests/                    Analytics, adapter, loading, and export tests
.github/workflows/ci.yml   Automated syntax checks and tests
server.mjs                Local static server
vercel.json               Static deployment settings
```

## ✅ Tests

```sh
npm test
npm run check
```

Or run both using the deployment build command:

```sh
npm run build
```

GitHub Actions runs syntax checks and tests on pushes and pull requests. Tests cover probability distributions, conservation of probability, empty matches, deterministic outcomes, input validation, coordinate conversion, shootout exclusion, download failures and retries, and JSON export round-trips.

## 📚 Data Source

Data provided by [**StatsBomb Open Data**](https://github.com/hudl/open-data). The bundled snapshot contains Argentina vs. France on **18 December 2022**, match ID `3869685`, with approximately **2.76–2.27 xG**.

To rebuild the bundled snapshot from its pinned upstream revision:

```sh
npm run data:refresh
```

This command requires internet access. The generated snapshot records its source URL, revision, and retrieval timestamp. Match browsing uses the public catalog separately, so available matches can change as StatsBomb updates the dataset.

StatsBomb’s logo and [original data license](dist/statsbomb-license.pdf) are included. Keep the attribution and license when hosting or sharing the project. The data license applies separately from the application code.
