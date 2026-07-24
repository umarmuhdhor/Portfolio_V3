# Deviations from the reference design system

Every difference between this build and kononenkogroup.com, with a reason.

The expected end state is **two** entries: the sans substitution, and any
letter-spacing calibration it required. A third entry means something is
unfinished, not that a third deviation was discovered.

Status: **Phase 0 complete.** No UI has been written yet, so no build-side
deviations exist. The permanent entry below is recorded up front because it is
a decision, not a discovery.

---

## 1. Sans typeface — Switzer Regular in place of PP Neue Montreal Regular

**Permanent. Decided in the brief, not a build failure.**

The reference sets its sans in PP Neue Montreal Regular (Pangram Pangram, a
commercial licence). No licence was purchased, and the reference's own
`n.woff2` is licensed to them — reusing it would be redistribution regardless
of how easy it is to fetch.

Switzer Regular (400) from Fontshare is used instead: free for commercial use,
the closest free neo-grotesque to Neue Montreal, with the same geometric
skeleton and near-identical x-height and cap-height ratios.

The serif is **not** a substitution. Hedvig Letters Serif 24pt Regular is the
reference's actual serif, it is SIL OFL, and it is used exactly.

### What this costs, and how the harness accounts for it

Switzer's glyph advance widths differ slightly from Neue Montreal. Nothing that
is not text-metric-derived is affected:

| Unaffected — still zero tolerance | Affected — widened tolerance |
|---|---|
| the 15-column grid | measured width of any text run |
| every `grid-column` span | bounding box of nav, headings, captions, footer links |
| every `margin-top` value | |
| frame heights | |
| the palette | |
| the easing curve and the five durations | |
| the type scale in `rem` | |
| the breakpoint | |
| the root font-size formula | |

Geometry tolerance is therefore **±2% of viewport width for text-bounded
elements only**, and stays at **±0.5%** for grid cards, section roots, and image
frames. Both bands are constants in `scripts/roles.mjs`, which is frozen and
hash-locked after Phase 0.

The `font-family` string is expected to differ on every role and is reported
rather than failed. What *is* asserted is that the correct one of the two
families is applied per role — sans vs serif — because which elements use the
serif is part of the design and must match.

---

## 2. Letter-spacing calibration for Switzer

**Not yet required.** Reserved for Phase 1, where cap-height and x-height are
compared between the two faces at a fixed size. If Switzer renders visibly
lighter or tighter, `letter-spacing` and `font-size` may be adjusted as a
documented calibration here.

The `rem` type scale values themselves are never adjusted.

---

## Corrections to Part 1 of the brief

Not deviations in the build — these are places where the captured measurement
disagreed with the hand-measured values in the brief. Per the brief's own rule,
the measurement wins and is reported rather than silently reconciled.

| Brief says | Capture found | Treatment |
|---|---|---|
| Type scale includes `20` and `32` | Neither exists as a `rem` font-size. `20px` and `32px` exist, in the dev grid overlay and the Nuxt error route respectively — neither is part of the design system. | Both dropped from the build's type scale. |
| Type scale omits `9` | `9rem` is present in the authored CSS (×2). | Added to the build's available scale. |
| Palette has 7 colours | `#f8f8f8` and `rgba(0, 0, 0, 0.4)` are also in production use. | Available to the build; not required, since our content may have no component that uses them. |
| Nav underline transitions `width, opacity 0.4s ease` | The nav underline is `transform 1.109s var(--ease)`, scaled on X. The `0.4s ease` pair belongs to the custom scrollbar thumb (`width` and `opacity`). | The `0.4s` duration is real and stays in the set; it is attributed to the scrollbar, not the nav. |
| "Serif is used for project captions and display accents only" | The serif carries **all** headings — `fn-h1` through `fn-h5` and every `h1`–`h6` — plus captions and the footer meta block. | The build follows the capture. |

None of these changed a zero-tolerance value. The cross-check scored **42/44
(95.5%)** against the brief; the two misses are the `20`/`32` type-scale entries
above.
