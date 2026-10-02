# Dyad Technologies QA Automation Practical Assessment

## Project Overview

This is a Playwright and TypeScript QA automation project using the Page Object
Model (POM). Playwright Test runs both completed assessment scenarios in
Chromium, provides assertions and diagnostics, and generates an HTML report.

## Applications

- Demo Web Shop: https://demowebshop.tricentis.com/
- ParaBank: https://parabank.parasoft.com/parabank/

## Scenarios

### Scenario 5 — Wishlist to Cart Validation

Registers a unique user, searches for books, adds two products to the wishlist,
handles the observed wishlist-to-cart behavior, validates cart contents and
quantity, calculates the subtotal dynamically, applies an invalid coupon, and
logs out. Prices and quantities are read from the UI rather than hardcoded.

### Scenario 6 — Multi-Account Fund Transfer Audit

Registers a unique user, creates two distinct accounts, captures balances,
performs a successful transfer, validates both balances and transaction
histories, checks duplicate/reference uniqueness, and validates the actual
behavior of an over-limit transfer.

## Framework

Node.js runs the project. TypeScript adds type checking. Playwright Test runs
the browser tests, provides assertions, and generates an HTML report.

The framework uses Page Object Model (POM): page classes contain locators and page
actions; test files describe workflows and assert business results. Shared helpers
will be added to `utils/` only when needed.

## Prerequisites and installation

- Node.js 22 or newer; Node.js 24 LTS is recommended for this project.
- npm (included with Node.js).
- Git for version control.

Run these commands from the project directory:

```bash
npm install
npx playwright install chromium
```

Only Chromium is needed because it is the only configured browser. `npm ci` may
also be used when installing exactly from the lockfile.

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

## Project files

| Path | Purpose |
| --- | --- |
| `pages/demoWebShop/` | Demo Web Shop page objects for registration, search, wishlist, cart, and logout. |
| `pages/paraBank/` | ParaBank page objects for registration, accounts, transfer, and transaction history. |
| `tests/wishlistToCart.spec.ts` | Scenario 5 workflow and assertions. |
| `tests/multiAccountFundTransfer.spec.ts` | Scenario 6 workflow and assertions. |
| `playwright.config.ts` | Browser, test execution, retries, and reporting settings. |
| `package.json` | Project metadata, command shortcuts, and three development dependencies. |
| `package-lock.json` | Exact dependency versions for repeatable installation; commit this file. |
| `tsconfig.json` | TypeScript checking rules and the files to check. |
| `.gitignore` | Excludes installed packages, reports, local environment files, and saved login sessions from Git. |
| `README.md` | Installation, verification, configuration, and usage instructions. |

`node_modules/`, `test-results/`, and `playwright-report/` are generated locally
and are ignored by Git.

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
soon as their conditions are met. The tests use Playwright auto-waiting and
web-first assertions without arbitrary sleeps.

There is no shared `baseURL` because the scenarios use different websites.
Navigation is kept in the corresponding page objects.

## Execution and reports

```bash
npm test
npm run test:headed
npm run test:debug
npm run report
```

These are shortcuts for `npx playwright test`, `npx playwright test --headed`,
`npx playwright test --debug`, and `npx playwright show-report` respectively.
The HTML report links to available failure artifacts.

Run Scenario 5:

```bash
npx playwright test tests/wishlistToCart.spec.ts
npx playwright test tests/wishlistToCart.spec.ts --headed
```

Run Scenario 6:

```bash
npx playwright test tests/multiAccountFundTransfer.spec.ts
npx playwright test tests/multiAccountFundTransfer.spec.ts --headed
```

Run all tests:

```bash
npx playwright test
```

Run the TypeScript check:

```bash
npx tsc --noEmit
```

## Assumptions and limitations

- This stage uses Chromium only and one worker to keep setup and execution simple.
- The Demo Web Shop registration form and successful result were inspected live.
  Registration succeeded without selecting the optional gender field. The form
  requires a password of at least six characters; the generated UUID meets that
  requirement.
- Successful registration displayed `Your registration completed` at
  `/registerresult/1`. The assertion checks the observed message, not a guessed
  URL or log entry.
- Scenario 5 and Scenario 6 are implemented for the selected Chromium project.
- Keep passwords and other secrets out of source files. Use local environment
  variables when needed. Never commit credentials or saved authentication state.

## Known Demo Application Behaviors

### Demo Web Shop

The public Demo Web Shop has shown inconsistent behavior when moving some
wishlist-enabled books to the cart. The implementation checks the resulting
cart state and uses the documented fallback product when the selected item does
not migrate reliably. This is treated as observed demo-site behavior, not as a
guaranteed product defect.

### ParaBank

Accounts Overview or Account Details may transiently show:

```text
Could not find account #...
```

The automation uses a bounded retry only for that exact known condition. It does
not broadly retry unrelated errors or use fixed delays.

In the tested public flow, ParaBank permits an over-limit transfer. The source
balance can become negative, the destination balance increases, and transaction
records are created in both histories. The automation validates this observed
behavior and identifies it as a possible business-rule defect; it does not
describe it as correct banking behavior.

Transaction-reference uniqueness is validated using transaction IDs exposed in
transaction-history links, independently within each account history.

Reference: [Playwright installation](https://playwright.dev/docs/intro),
[configuration](https://playwright.dev/docs/test-configuration), and
[TypeScript support](https://playwright.dev/docs/test-typescript).
