# Drawer

Path: `src/components/ui/drawer/Drawer.tsx`

Same chrome as [Dialog](dialog.md) (Card panel, title row, close icon, mask, stacking, scrollable body). Slides from one edge instead of centering.

Open: mask fades in first, then the panel slides in from its edge. Close: the panel slides back off that edge, then the mask fades out. Durations live in [overlay/config.ts](../../src/components/ui/overlay/config.ts) (`OVERLAY_MASK_FADE_SECONDS`, `OVERLAY_PANEL_SLIDE_SECONDS`).

## Props

All Dialog chrome props, plus:

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Use `DRAWER_SIDE` from `./config` |
| `cardClassName` | `string` | — | Override padding, radius on the Card |
| `panelClassName` | `string` | — | Override the positioned shell width (right/left default `w-[min(100%,420px)]`) |

Edge defaults:

- `top` / `bottom`: `width: 100%`, `max-h-[90vh]`, square corners on the screen edge
- `left` / `right`: shell `h-full w-[min(100%,420px)]` flush to that edge; Card is `w-full` with square corners on the screen edge. Wider drawers set `panelClassName`.

Mask, close, and title APIs match Dialog (`mask`, `maskClassName`, `closeOnMaskClick`, `titleClassName`, `closeClassName`, `closeIcon`).

## Example

```tsx
import { Drawer } from "@/components/ui/drawer/Drawer";
import { DRAWER_SIDE } from "@/components/ui/drawer/config";

<Drawer
  open={open}
  onClose={() => setOpen(false)}
  side={DRAWER_SIDE.Left}
  title="Filters"
  panelClassName="w-[min(100%,360px)]"
>
  Filter content
</Drawer>
```

## Notes

- Dialog on mobile is implemented as `Drawer` with `side="bottom"`.
- Overlays stack with Dialog instances (shared z-index stack).
