# Dyad Technologies QA Automation Practical Assessment

## Current stage

The framework setup is complete. Scenario implementation is progressing in small
steps:

- Scenario 5: Wishlist to Cart Validation (Demo Web Shop) — registration only.
- Scenario 6: Multi-Account Fund Transfer Audit (ParaBank) — not implemented.

Product search, wishlist, cart, coupon, and logout are not implemented yet.

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

## Run only the registration test

```bash
npx playwright test tests/wishlistToCart.spec.ts --project=chromium --grep "user registration is successful"
```

The test generates a fresh email and password with Node.js's built-in
`randomUUID()` on every attempt, including retries. First name (`QA`) and last
name (`User`) are simple static demo data. Credentials are generated in memory;
no password is stored in source code.

`RegisterPage.goto()` opens the registration page, and `register(user)` fills the
required fields and submits the form. The test then uses
`await expect(registerPage.successMessage).toBeVisible()` to assert the exact
observed message: **Your registration completed**.

Text fields and the submit button use `getByRole()`. Password inputs use
`getByLabel()` because password inputs do not have an implicit textbox role. The
success message is a plain text block and uses `getByText()` with `exact: true`.
All locators were created after inspecting the live form and result DOM.

## Project files

| Path | Purpose |
| --- | --- |
| `pages/demoWebShop/RegisterPage.ts` | Registration locators, navigation, and form submission. |
| `pages/paraBank/` | Future page objects for the bank. |
| `tests/wishlistToCart.spec.ts` | Scenario 5 registration test, runtime data, and success assertion. |
| `utils/` | Future shared helpers, such as runtime test data and currency parsing. |
| `.gitkeep` files | Placeholders from the initial setup so Git can preserve empty folders; no runtime behavior. |
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
soon as their conditions are met. Future tests will use Playwright auto-waiting
and web-first assertions without arbitrary sleeps.

There is no shared `baseURL` because the two planned scenarios use different
websites. Site navigation will be added with the corresponding page objects.

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

## Assumptions and limitations

- This stage uses Chromium only and one worker to keep setup and execution simple.
- The Demo Web Shop registration form and successful result were inspected live.
  Registration succeeded without selecting the optional gender field. The form
  requires a password of at least six characters; the generated UUID meets that
  requirement.
- Successful registration displayed `Your registration completed` at
  `/registerresult/1`. The assertion checks the observed message, not a guessed
  URL or log entry.
- The rest of Scenario 5 and all of Scenario 6 remain unimplemented. No behavior
  claims are made about those flows.
- Keep passwords and other secrets out of source files. Use local environment
  variables when needed. Never commit credentials or saved authentication state.

Reference: [Playwright installation](https://playwright.dev/docs/intro),
[configuration](https://playwright.dev/docs/test-configuration), and
[TypeScript support](https://playwright.dev/docs/test-typescript).
