# Loop design review — Phase 0

Run against `ecc:loop-design-check` before Phase 1, as the autorun addendum
requires. The skill reviews an agent loop for three ways loops fail: spinning
and burning tokens, running a wrong answer to completion, and Goodhart-gaming
the verifier. Recorded here with what it flagged and what was done.

## Should this loop exist at all — the 4-condition gate

| Condition | Verdict |
|---|---|
| Task repeats | Yes — 7 phases, up to 5 inner iterations each |
| Verification can be automated | Yes — `compare.mjs` exits non-zero on any failed assertion |
| Budget can take it | Stated $30–60, with a hard stop at $60 |
| Agent has tools that run and see the result | Yes — Playwright drives both sides and reads computed styles |

No veto.

## Goal definition

The done-criterion is machine-decidable: `npm run ab` exits 0. It is anchored to
**reconciliation, not assertion** — the comparison is against
`reference.fingerprint.json`, captured from the live reference site, which is
external fact rather than our own output. That is the strongest property this
harness has, and it is the reason a fidelity project is a better fit for an
autonomous loop than a quality project would be.

## Findings

### 1 — spins and burns tokens · NOT FLAGGED

The exit condition is a numeric comparison with a fixed assertion list, not a
judgement. Damping is present: 5 inner iterations per phase, then stop; plus
"the same assertion fails three times running" as a separate stop, which
correctly reads a repeated identical failure as a spec problem rather than an
implementation problem.

### 2 — the judge is the defendant · FLAGGED, MITIGATED

`compare.mjs` is deterministic and rule-based, so the *scoring* is not a
self-assessment. But the same agent writes both the CSS under test and the
scorer, so independence was procedural rather than structural.

Mitigation: `scripts/verify-harness.mjs` hashes the seven frozen files into
`harness.lock.json` and runs as the first step of `npm run ab`. Drift is a hard
failure before any assertion is evaluated.

### 3 — Goodhart-gaming the verifier · FLAGGED, MITIGATED

This is the live risk the autorun addendum names, and it deserved an enumeration
rather than a promise. Concrete ways a generator could turn a red gate green
without touching the CSS that was actually wrong:

| Attack | Now blocked by |
|---|---|
| Widen `TOLERANCE.geometry` from 0.005 | `roles.mjs` hashed |
| Add an entry to `EXCLUDE` in `compare.mjs` | `compare.mjs` hashed |
| Edit `reference.fingerprint.json` to match the build | fingerprint hashed — it is the reconciliation anchor |
| Delete or short-circuit assertions | `compare.mjs` hashed |
| Drop a role, or set `geometry: false` on one | `roles.mjs` hashed |
| Make `compare.mjs` exit 0 unconditionally | `compare.mjs` hashed |
| Break the stagger cascade resolver so both sides agree wrongly | `css-util.mjs` hashed **and** unit-tested against all ten brief rows |

Verified by mutation: changing `geometry: 0.005` to `0.05` makes
`verify-harness.mjs` exit 1 and name the file and what it controls.

The boundary condition is therefore stated alongside the done-criterion, which
is what the skill asks for: *pass the A/B* **and** *do not modify the A/B*.

Relocking remains possible with `--relock`, deliberately. A frozen harness that
can never change would be a worse failure mode than one that changes visibly —
the lock file is committed, so a relock shows up in the diff and has to be
explained in the phase report.

### 4 — counts on the agent asking mid-run · FLAGGED, FRONT-LOADED

The run is autonomous by instruction, so nothing can be deferred to a runtime
question. One ambiguity was live and has been settled now rather than during
Phase 1: the brief's type scale lists `20` and `32`, and the capture found
neither as a `rem` value. Per the brief's own rule the measurement wins, so both
are dropped and `9rem` is added. Recorded in `DEVIATIONS.md` under corrections.

### 5 — stale docs and memory · PARTIALLY FLAGGED

`DEVIATIONS.md` is the loop's own state document and nothing enforces its
freshness. Phase 6 checks its entry count against the expected two; between now
and then it is maintained by hand. Accepted as a known gap — the file is short
and the phase report quotes its count each time.

## Red lines

| Red line | Status |
|---|---|
| Judgment stays with the human | Delegated for the *gates* by explicit instruction — "the gate is the approval". The human kept the stop conditions, and Phase 0's ≥90% cross-check is the one gate that cannot be self-certified. It scored 95.5%. |
| Responsibility does not transfer | Nothing is published, deployed, or merged. All output is local files. |
| Self-rewriting loops need stricter review | This is exactly the tamper risk. Addressed by the hash lock rather than by intent. |

## Outcome

One blocking finding — Goodhart-gaming had no mechanism behind it — closed with
`verify-harness.mjs` and its mutation test. No remaining blocking findings.
