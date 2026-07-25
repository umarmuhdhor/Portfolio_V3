/**
 * Role map — the contract that makes the two sites comparable.
 *
 * The reference ships obfuscated class names; our build ships `data-role`
 * attributes. Every assertion in compare.mjs is keyed on a role, never on a
 * selector, so the two sides can look nothing alike in markup and still be
 * diffed value-for-value.
 *
 * `text` marks a role whose box is derived from measured text runs. Those get
 * the widened ±2% tolerance because Switzer's advance widths differ from
 * Neue Montreal (see DEVIATIONS.md).
 *
 * `family` is the expected type role: 'sans' | 'serif' | null (unchecked).
 * We never assert the font-family *string* — only that the correct one of the
 * two families is applied, since which elements use the serif is part of the
 * design.
 */

export const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080, mobile: false },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '375x812', width: 375, height: 812, mobile: true },
];

/** Design width per tier — root font-size is derived from this. */
export const DESIGN_WIDTH = { desktop: 1920, mobile: 375 };

/** The single breakpoint. No tablet tier exists. */
export const BREAKPOINT = { max: 767.98, min: 767.99 };

export const ROLES = [
  // --- structural ---------------------------------------------------------
  { id: 'html-root', ref: 'html', build: 'html', text: false, family: null, geometry: false },
  { id: 'body', ref: 'body', build: 'body', text: false, family: 'sans', geometry: false },
  { id: 'container', ref: '.ctr', build: '[data-role="container"]', text: false, family: null },
  { id: 'grid-root', ref: '.grd', build: '[data-role="grid"]', text: false, family: null },
  { id: 'section-root', ref: '#main > *, #main section', build: '[data-role="section"]', text: false, family: null, all: true },

  // --- header -------------------------------------------------------------
  { id: 'header', ref: '.kbp', build: '[data-role="header"]', text: false, family: null },
  { id: 'nav-link', ref: '.cjo ul li .link', build: '[data-role="nav-link"]', text: true, family: 'sans', all: true },
  { id: 'nav-counter', ref: '.wzy .uzq .xyb', build: '[data-role="nav-counter"]', text: true, family: 'sans' },

  // --- type scale ---------------------------------------------------------
  { id: 'h1', ref: '.fn-h1', build: '[data-role="h1"]', text: true, family: 'serif' },
  // The reference sets .fn-h2 and .fn-h4 in the sans via .f-mn — verified
  // against the live page, which contradicts the original map.
  { id: 'h2', ref: '.fn-h2', build: '[data-role="h2"]', text: true, family: 'sans' },
  { id: 'h3', ref: '.fn-h3', build: '[data-role="h3"]', text: true, family: 'serif' },
  { id: 'h4', ref: '.fn-h4', build: '[data-role="h4"]', text: true, family: 'sans' },
  { id: 'h5', ref: '.fn-h5', build: '[data-role="h5"]', text: true, family: 'serif' },
  { id: 'body-1', ref: '.fn-b1', build: '[data-role="body-1"]', text: true, family: 'sans' },
  { id: 'body-2', ref: '.fn-b2', build: '[data-role="body-2"]', text: true, family: 'sans' },
  { id: 'btn', ref: '.fn-btn', build: '[data-role="btn"]', text: true, family: 'sans' },

  // --- work grid — the centerpiece ---------------------------------------
  { id: 'work-grid', ref: '.frl', build: '[data-role="work-grid"]', text: false, family: null },
  { id: 'work-card', ref: '.frl .qct', build: '[data-role="work-card"]', text: false, family: null, all: true, card: true },
  { id: 'work-frame', ref: '.frl .qct .piz', build: '[data-role="work-frame"]', text: false, family: null, all: true },
  { id: 'work-meta-row', ref: '.frl .qct .i-w', build: '[data-role="work-meta-row"]', text: true, family: null, all: true },
  { id: 'work-caption', ref: '.frl .qct .i-c', build: '[data-role="work-caption"]', text: true, family: 'serif', all: true },

  // --- links / footer -----------------------------------------------------
  { id: 'link', ref: '.link', build: '[data-role="link"]', text: true, family: null },
  { id: 'footer', ref: '.anj', build: '[data-role="footer"]', text: false, family: null },
  { id: 'footer-link', ref: '.anj a', build: '[data-role="footer-link"]', text: true, family: null, all: true },
];

/** Computed-style properties captured for every role. */
export const STYLE_PROPS = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'color',
  'background-color',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'transition-property',
  'transition-duration',
  'transition-timing-function',
  'transition-delay',
  'display',
  'overflow',
  'position',
  'text-align',
  'grid-template-columns',
  'grid-column-start',
  'grid-column-end',
  'height',
  'width',
  'will-change',
  'outline',
  'outline-offset',
  'pointer-events',
  'transform',
  'transform-origin',
  'opacity',
  'gap',
];

/** Ground truth from Part 1 of the brief. crosscheck.mjs scores against this. */
export const BRIEF = {
  rootFontSizeDesktop: '0.0520833333vw',
  rootFontSizeMobile: '0.2666666667vw',
  breakpointMax: 767.98,
  breakpointMin: 767.99,
  gridTemplateColumns: 'repeat(15, 1fr)',
  gridColumnCount: 15,
  palette: ['#000', '#fff', '#e2e2e2', '#eee', '#f0f0f0', '#ccc', '#929292'],
  typeScale: [12, 14, 16, 18, 19, 20, 26, 30, 32, 36, 40, 80, 118, 175, 200, 400],
  ease: 'cubic-bezier(0.17, 0.84, 0.44, 1)',
  easeCompact: 'cubic-bezier(.17,.84,.44,1)',
  durations: [0.3, 0.4, 0.5, 0.6, 1.109],
  spacingTokens: { '--space-general': '2em', '--space-heading': '1em', '--off': '0.5em' },
  keyframeCount: 0,
  /** nth-child → { column, marginTop (rem), frameHeight (rem) } */
  stagger: [
    { nth: '10n+1', column: '1 / 8', marginTop: 0, frameHeight: 540 },
    { nth: '10n+2', column: '9 / -1', marginTop: 170, frameHeight: 540 },
    { nth: '10n+3', column: '1 / 5', marginTop: 416, frameHeight: 700 },
    { nth: '10n+4', column: '6 / 12', marginTop: 188, frameHeight: 540 },
    { nth: '10n+5', column: '8 / 15', marginTop: -214, frameHeight: 540 },
    { nth: '10n+6', column: '5 / 9', marginTop: 178, frameHeight: 700 },
    { nth: '10n+7', column: '1 / 8', marginTop: 323, frameHeight: 540 },
    { nth: '10n+8', column: '9 / -1', marginTop: 154, frameHeight: 540 },
    { nth: '9n+9', column: '2 / 8', marginTop: 638, frameHeight: 500 },
    { nth: '10n+10', column: '11 / -2', marginTop: 100, frameHeight: 700 },
  ],
  hover: {
    imageScale: 1.035,
    imageDuration: 1.109,
    captionOut: '-101%',
    captionIn: '101%',
    captionDuration: 0.6,
    underlineDelay: 0.3,
  },
  mobileGrid: { cardGap: 60, innerGap: 10, frameHeight: 215 },
};

/** Tolerance bands, as a fraction of viewport width. */
export const TOLERANCE = { geometry: 0.005, text: 0.02 };
