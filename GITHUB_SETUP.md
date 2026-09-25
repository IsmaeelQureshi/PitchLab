# Upload PitchLab to your GitHub

Repository: https://github.com/IsmaeelQureshi/PitchLab

The project uses the `main` branch. The `origin` remote points to the repository above.

For future changes:

```sh
npm run check
npm test
git add .
git commit -m "Describe your change"
git push
```

## Local development

Install Node.js 20 or later, then:

```sh
npm start
```

Open http://127.0.0.1:4173. No npm install is needed because this project uses no external npm dependencies. Use Ctrl+C to stop it.

The CI workflow runs syntax checks and tests on GitHub; it does not publish the app. Keep the StatsBomb attribution, logo, and data license included with the dataset.
