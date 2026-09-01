# Public Component Changelog

Record every create/update of components under `src/components/ui/` so other agents can discover new APIs.

## 2026-09-01

- **Dropdown:** Panel scroll no longer closes the menu. Optional `onReachEnd` (sentinel IntersectionObserver) and `loadingMore` for infinite option lists.

## 2026-08-30

- **Drawer:** `panelClassName` sizes the positioned shell. Right/left default width is on the shell (`w-[min(100%,420px)]`); the Card is `w-full`. Overlay `mask={false}` uses `pointer-events-none` on the root so the page behind stays clickable; the panel is `pointer-events-auto`.
- **Dialog / Drawer / OverlayPanel:** Masked panels move focus inside, trap Tab focus, restore the previous focus on close, and associate visible titles with the dialog. Added `ariaLabel` for titleless panels.
- **OverlayPanel:** Title uses `min-w-0` so long titles do not widen the panel.

## 2026-08-28

- **Checkbox:** 16px square toggle (`checked` / `defaultChecked` / `onCheckedChange`). Unchecked white + `#E3E3E3` border; checked `#6284F5` with white `IconCheck`.
- **Button:** Added `danger` variant (`bg-danger` / white text, same hover opacity as primary).
- **Drawer:** Mask fades in first, then the panel slides from its edge (`right` → left, `bottom` → up, and the reverse on close). Overlay stays mounted through the exit so the slide can finish.
- **Toast:** Documented existing card + `useToast()` (`success` / `fail` / `info` / `loading` / `notice` / `dismiss`). Type glyphs stay in `Toast.tsx`.
- **InputNumber:** Documented existing decimal text input (`onNumberChange`, optional `decimals`).

## 2026-08-26

- **Tooltip:** `triggerClassName` on the trigger wrapper. Cardinal `side` values (`top` / `right` / `bottom` / `left`) center on that edge; eight composite values (`top-left`, `left-bottom`, …) edge-align.
- **Overlay (`FLOATING_SIDE`):** Twelve placements relative to the trigger. Composite sides resolve to a cardinal side plus `align` and ignore a passed `align`. Cardinal sides still use the caller’s `align` (default `start`).

## 2026-08-25

- **DateRangePicker:** Second calendar click may be the same day as the first (single-day range). Custom one-day ranges show one date, not `MMM d, yyyy – MMM d, yyyy`.

## 2026-08-24

- **DateRangePicker:** Shared time-range calendar (presets + two-click range). Extracted from Partner Reports for History.
- **Table:** Scroll children wrap in `w-max min-w-full` so the header spans the horizontal overflow; `toolbar` / `footer` sit outside the scroller; cells use `min-w-0`.
- **Dropdown:** Optional `label` prefix on the trigger (gray, left; selected value stays right-aligned). Narrow triggers truncate label/value and keep the chevron inside (`overflow-hidden`).
- **Pagination:** Restyled to Montserrat / currentColor; typed `page`, `totalPage`, `onPageChange`.
- **SearchInput / Dropdown:** Default placeholders (`Search` / `Select`) live on the component, not sibling `config.ts`.
- **Tooltip:** `leaveDelay` `0` (default) sets `pointer-events: none` on the panel so it cannot cover the trigger and flicker.
- **Overlay (`useFloatingPosition`):** Measure the panel without forcing `width: max-content`, so className widths such as `w-[285px]` are used for placement.

## 2026-08-21

- **Dialog / OverlayPanel / Drawer:** optional `headerAction` next to the title (outside `<h2>`).
- **UI styles:** Tailwind class names live in the component files (not `config.ts`) so they are easier to maintain.
- **Card:** Initial public card primitive (`rounded-[20px]`, white border, `#FDFDFD`, 20px padding, shadow).
- **Dialog:** Centered modal on desktop; bottom drawer on viewports below 768px. Stacking overlays, mask, optional title, scrollable body.
- **Drawer:** Directional overlay (`top` / `right` / `bottom` / `left`) sharing Dialog chrome (mask, title, close, stacking).
- **Button:** `primary` / `normal` variants, `xl` / `lg` / `md` / `sm` sizes, `loading`, `rounded` override.
- **Tooltip:** Portal to `document.body`, closes on scroll, `leaveDelay` default `0`.
- **SearchInput:** Pill search field with `IconSearch` and custom clear control (native clear hidden).
- **Table:** CSS Grid compound table with sticky header and a single scroll container (no header/body column drift).
- **Dropdown:** Select-style menu; arrow rotates when open; panel portaled to `document.body`. First-open position uses an off-flow measure so the panel is not clamped to the left of the viewport.
- **Switch:** Pill toggle (`33.333×20`). Off track `#F6F6F6`, on track `#6284F5`. Thumb slides with Motion.
