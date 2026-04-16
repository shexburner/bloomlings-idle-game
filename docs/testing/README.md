# Testing

Owned by the Quality Engineer Lead (`.claude/personas/qe-lead.md`).

## Where things live

| Artifact | Path |
|----------|------|
| Test case catalog | [test-cases.md](./test-cases.md) |
| Nightwatch e2e suite | [../../e2e/](../../e2e/) |
| Nightwatch config | [../../nightwatch.conf.js](../../nightwatch.conf.js) |
| Suite run reports | `docs/testing/run-YYYY-MM-DD.md` |
| QE persona | [../../.claude/personas/qe-lead.md](../../.claude/personas/qe-lead.md) |
| QE agent | [../../.claude/agents/qe-lead.md](../../.claude/agents/qe-lead.md) |

## Running the suite

Full prereqs + troubleshooting live in [e2e/README.md](../../e2e/README.md). TL;DR:

```bash
npm run appium             # terminal 1 — leave running
npm run test:e2e:smoke     # terminal 2 — fast P0 smoke sweep
npm run test:e2e           # full automated suite (skips manual-tagged specs)
```

Nightwatch drives the app via Appium's UiAutomator2 driver against a real Android device (`R5CX92JPGHY` by default — override with `ANDROID_UDID`).

## Reading a run report

`docs/testing/run-YYYY-MM-DD.md` contains:
- Device + build variant + app version
- Per-spec pass/fail with duration
- Screenshot + log paths for failures (Nightwatch writes them under `tests_output/`)
- A defects table linking each failure to a `TC-*` case and an issue tracker entry

## Priorities

- **P0** — must pass before a phase ships; automated in `e2e/tests/`.
- **P1** — should pass; failures investigated within a sprint.
- **P2** — manual-only, exploratory.

Specs tagged `manual` require a seeded save (captured via Settings → Export Save) and are skipped by the default `test:e2e` run.

## Filing defects

Use the `[QE-XXX]` bug-report format defined in the QE persona. Always reference the `TC-*` case ID. Attach the Nightwatch screenshot from `tests_output/`.

## Growth model

1. Every shipped feature lands with at least one P0 case in `test-cases.md` **in the same PR**.
2. P0 cases get automated in `e2e/tests/` **before merge**.
3. Seeds for late-game scenarios are captured as the feature matures (see `e2e/seeds/`).
