<<<<<<< HEAD
# Dyad Technologies QA Automation Practical Assessment

## Current stage

Initial Playwright and TypeScript setup only. The following scenarios are planned
and have not been implemented:

- Scenario 5: Wishlist to Cart Validation (Demo Web Shop).
- Scenario 6: Multi-Account Fund Transfer Audit (ParaBank).

There are no automated tests or page objects yet.

## Framework

Node.js runs the project. TypeScript adds type checking. Playwright Test will run
the browser tests, provide assertions, and generate an HTML report.

The final framework will use Page Object Model (POM): page classes will contain
locators and page actions; test files will describe workflows and assert business
results. Shared helpers will be added to `utils/` only when needed.

## Prerequisites and installation

- Node.js 22 or newer; Node.js 24 LTS is recommended for this project.
- npm (included with Node.js).
- Git for version control.

Run these commands from the project directory:

```bash
npm ci
npx playwright install chromium
```

`npm ci` installs the versions recorded in `package-lock.json`. Only Chromium is
needed because it is the only configured browser.

If Playwright reports missing Linux system libraries, install them with:

```bash
npx playwright install --with-deps chromium
```

Installing system libraries may require administrator privileges.

## Verify this setup

```bash
npm run typecheck
npx playwright --version
npx playwright screenshot --browser chromium about:blank test-results/setup-check.png
```

These commands check TypeScript, print the installed Playwright version, and
launch Chromium to save a screenshot. The blank screenshot is expected: this
checks browser startup without visiting either assessment website. It is not a
scenario test or evidence that either scenario passes.

`npm test` currently reports **No tests found**, because `tests/` is intentionally
empty apart from its Git placeholder. An HTML test report becomes useful after
real tests are added.

## Project files

| Path | Purpose |
| --- | --- |
| `pages/demoWebShop/` | Future page objects for the shop. |
| `pages/paraBank/` | Future page objects for the bank. |
| `tests/` | Future scenario workflows and business assertions. |
| `utils/` | Future shared helpers, such as runtime test data and currency parsing. |
| `.gitkeep` files | Empty placeholders so Git can preserve the four empty folders. |
| `playwright.config.ts` | Browser, test execution, retries, and reporting settings. |
| `package.json` | Project metadata, command shortcuts, and three development dependencies. |
| `package-lock.json` | Exact dependency versions for repeatable installation; commit this file. |
| `tsconfig.json` | TypeScript checking rules and the files to check. |
| `.gitignore` | Excludes installed packages, reports, local environment files, and saved login sessions from Git. |
| `README.md` | Installation, verification, configuration, and usage instructions. |
| `Dyad_QA_Assignment_Context.md` | Primary assignment requirements. |

`node_modules/` and `test-results/` are generated locally and are ignored by Git.

The three development dependencies are `@playwright/test` (runner, browser tools,
assertions, and reporters), `typescript` (type checker), and `@types/node` (type
definitions for Node.js APIs). `private: true` prevents accidental npm publishing.

In `tsconfig.json`, `strict` enables stronger type checks and `noEmit` prevents
extra JavaScript output. Playwright runs TypeScript directly, but does not perform
full type checking, which is why `npm run typecheck` is a separate command.
`target` selects modern JavaScript features, and `NodeNext` uses Node.js module
rules. `types` provides Node.js definitions, `esModuleInterop` helps compatible
imports, and `skipLibCheck` skips checking dependency declaration files. `include`
limits checks to the configuration and our source folders.

## Playwright configuration

| Setting | Meaning |
| --- | --- |
| `defineConfig(...)` | Provides typed configuration and editor suggestions. |
| `testDir: './tests'` | Find test files in `tests/`. |
| `fullyParallel: false` | Do not opt into running every test in parallel. |
| `workers: 1` | Run one test worker at a time, including across files, to reduce load on the public sites. |
| `retries: 1` | Retry a failed test once; at most two attempts. |
| `timeout: 60_000` | Allow up to 60 seconds per test. |
| `expect.timeout: 10_000` | Web-first assertions can retry for up to 10 seconds. |
| `list` reporter | Display individual test results in the terminal. |
| `html` reporter, `open: 'never'` | Generate `playwright-report/` without automatically opening a browser. |
| `outputDir: 'test-results'` | Store test artifacts here. |
| `screenshot: 'only-on-failure'` | Capture screenshots when tests fail. |
| `trace: 'on-first-retry'` | Record the first retry for debugging actions and page state. |
| `video: 'retain-on-failure'` | Keep videos for failed attempts and discard videos for successful ones. |
| `projects` with `Desktop Chrome` | Run one Chromium project with desktop browser settings, headless by default. |

Timeouts are upper limits, not fixed delays. Actions and assertions continue as
soon as their conditions are met. Future tests will use Playwright auto-waiting
and web-first assertions without arbitrary sleeps.

There is no shared `baseURL` because the two planned scenarios use different
websites. Site navigation will be added with the corresponding page objects.

## Commands for use after tests are added

```bash
npm test
npm run test:headed
npm run test:debug
npm run report
```

These are shortcuts for `npx playwright test`, `npx playwright test --headed`,
`npx playwright test --debug`, and `npx playwright show-report` respectively.
The HTML report links to available failure artifacts.

## Assumptions and limitations

- This stage uses Chromium only and one worker to keep setup and execution simple.
- Neither demo website has been inspected or tested in this stage. Observed site
  behavior and limitations will be documented during scenario implementation.
- Keep passwords and other secrets out of source files. Use local environment
  variables when needed. Never commit credentials or saved authentication state.
- Git has not been initialized and no commit has been created in this stage.

Recommended first commit message:

```text
chore: initialize Playwright TypeScript project
```

Reference: [Playwright installation](https://playwright.dev/docs/intro),
[configuration](https://playwright.dev/docs/test-configuration), and
[TypeScript support](https://playwright.dev/docs/test-typescript).
>>>>>>> c310068 (chore: initialize Playwright TypeScript project)
