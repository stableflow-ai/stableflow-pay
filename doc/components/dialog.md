# Dialog

Path: `src/components/ui/dialog/Dialog.tsx`

Figma: DapDap V2 `41559:93`.

Centered modal on desktop (`min-width: 768px`). Below that breakpoint it renders [Drawer](drawer.md) with `side="bottom"` and `width: 100%`. Nested dialogs stack (each open instance gets a higher z-index). Escape closes the topmost overlay.

On desktop, open fades the mask and panel together (0.1s). Close fades the panel first, then the mask (`OVERLAY_DIALOG_PANEL_FADE_SECONDS` in `overlay/config.ts`). There is no panel slide. On a narrow viewport the bottom Drawer slides up on open and down on close.

Masked dialogs move focus to the panel, keep Tab focus inside it, and restore focus to the previously focused control when they close. The visible title labels the dialog through `aria-labelledby`; pass `ariaLabel` when no visible title is rendered.

The panel uses [Card](card.md) defaults. The title row is always rendered (styles reserved) even when `title` is empty. Body content is passed as `children` and scrolls when it exceeds `max-h-[90vh]`.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | required | Controlled visibility |
| `onClose` | `() => void` | — | Mask click, close button, Escape |
| `title` | `ReactNode` | — | Optional; header layout is kept |
| `ariaLabel` | `string` | — | Accessible name when `title` is empty |
| `children` | `ReactNode` | — | Scrollable body |
| `mask` | `boolean` | `true` | When `false`, backdrop is transparent |
| `maskClassName` | `string` | — | Backdrop classes. Default fill is `rgba(0,0,0,0.50)` |
| `closeOnMaskClick` | `boolean` | `true` | Click backdrop to close |
| `cardClassName` | `string` | — | Panel / Card classes |
| `titleClassName` | `string` | — | Title `<h2>` |
| `headerAction` | `ReactNode` | — | Optional control next to the title (not inside `<h2>`), before the close button |
| `closeClassName` | `string` | — | Close button |
| `closeIcon` | `ReactNode` | `IconClose` | Replace the default close icon |
| `elevated` | `boolean` | `false` | Visual `z-index` is `WALLET_PORTAL_Z_INDEX` plus the overlay stack offset, so wallet dialogs stay above TokenSelect / other app dialogs. Escape still uses the overlay stack. |

## Example

```tsx
import { Dialog } from "@/components/ui/dialog/Dialog";
import { Button } from "@/components/ui/button/Button";

<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Create New API Key"
  closeOnMaskClick
>
  <Button className="w-full" size="lg">Create</Button>
</Dialog>
```

## Notes

- Multiple dialogs can be open at once; only the top overlay handles Escape and receives the topmost mask.
- Wallet SDK portals (RainbowKit, Near, Solana, Tron, including `.ledger-modal-*`) sit at `WALLET_PORTAL_Z_INDEX` (`10000`), above ordinary dialog layers. Pass `elevated` for in-app wallet dialogs (Ledger USB / Retry, Blind signing) so they sit in that same band.
- Focus trapping applies to masked dialogs. A transparent `mask={false}` overlay remains non-modal and does not trap focus.
- Do not import `src/components/ui/overlay/` from feature code.
- Mobile stacking uses bottom drawers, also layered by z-index.
