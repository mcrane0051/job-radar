# Design System Rules

This document is the source of truth for how UI is built in this project. If you are an agent generating or modifying UI, follow these rules exactly. When a rule and a screenshot disagree, the rule wins — ask before deviating.

**Theme:** dark. Semantic tokens resolve against the `Dark` mode. There is no light mode yet.

**Typography:** monospace only. JetBrains Mono is used exclusively across every text style.

---

## If in doubt

1. Need a color, size, or font? → Check semantic tokens, then primitives. If none fits, **ask** — do not invent.
2. Building something new? → Compose from existing primitives before creating a new component.
3. Adding a state, variant, or breakpoint? → It must appear in this doc first.
4. About to hardcode a value? → Stop. Reference a token.

---

## 1. Token usage

**Rule: never hardcode design values. Reference tokens.**

Three layers, always resolve top-down:

| Layer | Example | Use in |
|---|---|---|
| Primitive | `green/500`, `spacing/16` | Only inside semantic tokens or as documented exceptions |
| Semantic | `text/primary`, `surface/0` | Default choice in components |
| Component | (not yet defined) | Introduce when a component has repeated custom needs |

Forbidden: raw hex, raw px (except border widths ≤ 2px and the documented `spacing/4` half-step), `rgba()` outside token definitions, inline styles.

### 1.1 Color primitives

Four 10-step ramps. Use through semantic tokens whenever possible.

**green** — brand / text
`green/50` `#EEF8F3` · `green/100` `#D4EDE1` · `green/200` `#BAE2CF` · `green/300` `#97D4B8` · `green/400` `#75C5A0` · `green/500` `#52B788` · `green/600` `#42926D` · `green/700` `#316E52` · `green/800` `#214936` · `green/900` `#10251B`

**amber** — warning
`amber/50` `#FDF8F2` · `amber/100` `#FAEFE1` · `amber/200` `#F7E3C9` · `amber/300` `#F3D4AE` · `amber/400` `#EDC189` · `amber/500` `#E5A657` · `amber/600` `#C08B49` · `amber/700` `#9C713B` · `amber/800` `#73532C` · `amber/900` `#45321A`

**red** — error
`red/50` `#FDF3F2` · `red/100` `#FAE4E2` · `red/200` `#F7CFCB` · `red/300` `#F3B7B1` · `red/400` `#ED968D` · `red/500` `#E5695C` · `red/600` `#C0584D` · `red/700` `#9C473F` · `red/800` `#73352E` · `red/900` `#45201C`

**neutral** — surface / structure
`neutral/50` `#EBECEC` · `neutral/100` `#DADCDC` · `neutral/200` `#C1C4C4` · `neutral/300` `#9CA1A1` · `neutral/400` `#777E7E` · `neutral/500` `#565F5F` · `neutral/600` `#394343` · `neutral/700` `#202B2B` · `neutral/800` `#0C1919` · `neutral/900` `#071414`

### 1.2 Semantic tokens (Dark mode)

| Token | Alias | Resolved |
|---|---|---|
| `text/primary` | `green/500` | `#52B788` |
| `text/secondary` | `green/600` | `#42926D` |
| `text/tertiary` | `green/700` | `#316E52` |
| `status/warning` | `amber/500` | `#E5A657` |
| `status/error` | `red/500` | `#E5695C` |
| `surface/0` | `neutral/900` | `#071414` — page background |
| `surface/1` | `neutral/800` | `#0C1919` — raised surfaces (cards, active states) |
| `border/radar` | — | `rgba(199, 227, 104, 0.43)` — radar screen edge |

**Coverage gaps to flag before shipping:** there is no semantic token for borders, focus ring, disabled text, success, or link/hover. Until those exist, propose a name (e.g. `border/subtle`, `state/focus`) and add it here — do not reach into primitives ad-hoc.

### 1.3 Spacing (8pt grid)

| Token | Value |
|---|---|
| `spacing/4` | 4px (half-step — optical only) |
| `spacing/8` | 8px |
| `spacing/12` | 12px |
| `spacing/16` | 16px |
| `spacing/24` | 24px |
| `spacing/32` | 32px |
| `spacing/40` | 40px |
| `spacing/48` | 48px |
| `spacing/64` | 64px |
| `spacing/80` | 80px |
| `spacing/96` | 96px |
| `spacing/128` | 128px |

Usage guidelines:

- **Tight elements** (tags, buttons, chips): `spacing/8`–`spacing/16`
- **Cards and containers**: `spacing/16`–`spacing/24`
- **Related items in a stack**: `spacing/8`
- **Grouped sections**: `spacing/16`
- **Between major sections**: `spacing/32`–`spacing/48`
- **Page-level section separation**: `spacing/32`+
- `spacing/4` is the only permitted half-step, for fine optical adjustments only (tag padding, icon alignment).

### 1.4 Typography

Font family: **JetBrains Mono** (monospace). No other font families are permitted.

| Style | Weight | Size | Line height |
|---|---|---|---|
| Hero | ExtraBold | 44px | 52px |
| H1 | ExtraBold | 32px | 40px |
| H2 | Bold | 24px | 32px |
| H3 | Bold | 20px | 28px |
| H4 | Medium | 16px | 24px |
| Body | Regular | 14px | 20px |
| Small | Regular | 12px | 16px |

### 1.5 Radius

Not yet tokenized. Known values in use: `8px` (Job Post Card), `~6px` (Button inner), `2px` (New tag). Propose `radius/sm`, `radius/md`, `radius/lg` when a third component needs a shared value.

---

## 2. Layout & spacing

- **Base unit:** 8px. Use `spacing/*` tokens exclusively.
- **Grid:** 12 columns.
- **Gutter:** `spacing/24`.
- **Page margin:** `spacing/32` (desktop), `spacing/16` (mobile).
- **Max content width:** 1200px, centered with auto margins.
- **Stacks default to vertical** (`flex-col`). Horizontal requires deliberate choice.
- **Gap over margin** when using flex/grid. Margin only for breaking flow.

---

## 3. Responsive

- **Mobile-first.** Base styles are mobile; breakpoints add up.
- **Breakpoints:** named `sm`, `md`, `lg`, `xl` — actual values TBD. Never write raw pixel media queries.
- **Touch targets:** minimum 44×44px on any tap surface.
- **Do not hide critical actions on mobile.** Reflow, don't remove.

---

## 4. Component rules

For every component, the following must be explicit:

- Required props vs. optional props.
- Allowed variants (enumerated — no free strings).
- Which slots accept children.
- Forbidden compositions (e.g., "Card cannot contain Card").

**Rule: agents may not add new variants without updating this doc first.**

### 4.1 Job Post Card

Horizontal card displaying a job listing with a best-fit score, job details, and an optional "NEW" tag.

- **Layout:** horizontal, gap `spacing/16`, vertical padding `spacing/4`.
- **Corner radius:** 8px.
- **Width:** 1192px (content-driven). **Height:** ~92px.

**Anatomy**

- `bestFit_score` — 64×64 circle, 2px `green/600` stroke, centered score number in `H4` style.
- `jobDetails` — vertical stack, gap `spacing/8`.
  - `job_header` — horizontal row, gap `spacing/16`.
    - `title_company` — horizontal row, gap `spacing/12`.
      - Job title: `H3` style.
      - Company name: JetBrains Mono Bold 16px.
    - `New Tag` — pill label. Fill `green/900`, radius 2px, padding `spacing/4` vertical / `spacing/8` horizontal. Text: "NEW" in JetBrains Mono ExtraBold 12px.
  - Location / industry: `Body` style.
  - Posted date / source: `Small` style.

**States**

| State | Background | Border |
|---|---|---|
| Default | transparent | none |
| Hover | transparent | 1px `green/600` |
| Active | `green/900` | none |

Missing (add before shipping): focus-visible, disabled, loading skeleton.

### 4.2 Button

Keycap-style button with a raised "rubber-dome" inner surface. Inspired by mechanical keyboard keys.

- **Outer frame:** 60×44px, fill `green/900`.
- **Inner frame:** 58×42px, linear gradient fill, radius ~6px, horizontal padding `spacing/12`.
- **Inner shadow:** `green/300` at 12.5% opacity, offset 1/1px, blur 2px.
- **Text:** IBM Plex Mono Bold 14px, color `text/primary`, uppercase.

> ⚠️ The Button text style specifies IBM Plex Mono, but the system otherwise mandates JetBrains Mono exclusively. **Resolve before implementation** — either add IBM Plex Mono as a documented exception here, or update the Button spec to JetBrains Mono.

**Variants** (component set: `variant × state`)

| variant | state |
|---|---|
| `primary` | `default` |
| `primary` | `hover` |
| `primary` | `pressed` |

Missing (add before shipping): focus-visible, disabled, loading. Secondary / ghost / destructive variants are not yet defined — do not invent them.

---

## 5. State coverage

Every interactive element **must** handle all applicable states:

`default` · `hover` · `focus-visible` · `active` · `disabled` · `loading` · `error` · `empty` · `read-only`

**Rule: no interactive element ships without focus-visible styling.**

Views must also handle: loading skeleton, empty state, error state, success state. No blank screens.

> The current Figma library defines default/hover/active only. Focus-visible and disabled must be designed alongside implementation — flag and coordinate, don't guess.

---

## 6. Accessibility

Non-negotiable:

- **WCAG 2.2 AA** minimum.
- **Contrast:** 4.5:1 for body text, 3:1 for large text and UI components.
  - ⚠️ `text/tertiary` (`green/700` `#316E52`) on `surface/0` (`#071414`) is likely under 4.5:1. Use `text/tertiary` only for large text or decorative labels — never body copy — until contrast is verified.
- **Focus ring:** visible on every interactive element. Never `outline: none` without a replacement. A `state/focus` token needs to be added — until then, propose a value in the PR.
- **Semantic HTML first.** Use `<button>`, `<a>`, `<nav>`, `<main>`. Reach for ARIA only when semantics run out.
- **Labels:** every input has a `<label>` (visible or `sr-only`). Placeholder is not a label.
- **Keyboard:** all interactions reachable and operable by keyboard. Tab order follows visual order.
- **Motion:** respect `prefers-reduced-motion`. No parallax, autoplay, or looping motion without a pause control.
- **Images:** `alt` required. Decorative → `alt=""`.

---

## 7. Motion

Motion tokens are not yet defined. Until they are:

- **Animate:** `opacity`, `transform`. **Never:** `width`, `height`, `top`, `left` (use transform).
- **Duration:** keep under 300ms for state transitions. No decorative animation on primary flows.
- **Propose** a `motion/*` scale (fast / base / slow + easing) the first time a component needs animation beyond a simple hover.

---

## 8. Content & microcopy

- **Voice:** _[TBD — define house voice before shipping user-facing copy]_.
- **Case:** sentence case for buttons, labels, headings. Title case only for proper nouns. Exception: the "NEW" tag is uppercase by spec.
- **Errors:** "what happened + how to fix." Never blame the user. Never say "invalid" alone.
- **Empty states:** describe what will appear here + one clear next action.
- **Numbers:** localized. Currency includes symbol and code where ambiguous.

---

## 9. Iconography

- **Source:** _[TBD — pick one library and lock it in]_.
- **Sizes:** propose `icon/sm` (16), `icon/md` (20), `icon/lg` (24) tokens when a second component needs icons.
- **Stroke weight:** consistent across the app.
- **Alignment:** icons align to text cap-height, not baseline.
- **Standalone icons need an accessible name** (`aria-label` or visually hidden text).

---

## 10. Forms

- **Labels:** above the field. Required marked with `*` and `aria-required`.
- **Validation:** on blur for individual fields, on submit for the form. Never on every keystroke.
- **Errors:** inline below the field in `status/error`, with an icon. Summary at top for long forms.
- **Disabled submit:** avoid; prefer submit + inline errors so users learn what's missing.
- **Autofocus:** first field on empty forms only. Never re-focus on validation.

---

## 11. Data display

- **Tables** for two-dimensional data. **Lists** for one-dimensional.
- **Zebra striping** off by default. Use `surface/1` and borders sparingly.
- **Long text** wraps; never `text-overflow: ellipsis` without a tooltip or "show more."
- **Pagination** over infinite scroll for anything users might need to return to.

---

## 12. Do / don't

**Colors**
- ✅ `background: var(--surface-0)` / `color: var(--text-primary)`
- ❌ `background: #071414` / `color: #52B788`

**Spacing**
- ✅ `gap: var(--spacing-16)`
- ❌ `margin-top: 13px`

**Typography**
- ✅ Apply the `Body` style token / class
- ❌ `font: 14px "JetBrains Mono"`

**Buttons**
- ✅ `<Button variant="primary">Save</Button>`
- ❌ `<div onClick={...} style={{background: '#10251B'}}>Save</div>`

**States**
- ✅ Component handles hover, focus-visible, active, disabled, loading
- ❌ Ship with default/hover only because the Figma only shows those

---

## 13. Escape hatches

Deviations require a comment the grep can find:

```tsx
// design-deviation: <reason>
```

If a design-deviation stays in the codebase for more than one PR, the doc is wrong — update this file.

---

## 14. Pre-ship checklist

Before opening a PR, the agent must confirm:

- [ ] No hardcoded colors, sizes, or fonts.
- [ ] All colors reference `text/*`, `status/*`, `surface/*`, or a documented primitive.
- [ ] All spacing lands on the 8pt grid via `spacing/*` tokens.
- [ ] All type uses one of the seven text styles (Hero, H1–H4, Body, Small).
- [ ] All interactive elements have hover, focus-visible, active, disabled states.
- [ ] Loading, empty, and error states exist for every view.
- [ ] Keyboard-navigable end to end.
- [ ] Contrast passes at AA (watch `text/tertiary` on `surface/0`).
- [ ] `prefers-reduced-motion` respected.
- [ ] Responsive from 360px to 1440px+.
- [ ] No new variants, tokens, or components introduced without updating this doc.
