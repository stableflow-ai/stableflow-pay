# Checkbox

Path: `src/components/ui/checkbox/Checkbox.tsx`

Square toggle. The control is 16px; the label is composed by the caller. Checked fill matches [Switch](switch.md) on (`#6284F5`) with a white `IconCheck`.

## Defaults

- Size `16×16`, `border-radius: 4px`
- Unchecked: white fill, 1px border `#E3E3E3`
- Checked: `#6284F5` fill, white check glyph
- Disabled: `opacity: 0.3` and `cursor: not-allowed` (`pointer-events: none`)

## Props

Omits native `onChange` / `role` / `aria-checked` / `children`. Other button attributes are forwarded.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `checked` | `boolean` | — | Controlled. Omit for uncontrolled |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial value |
| `onCheckedChange` | `(checked: boolean) => void` | — | Fires after a toggle |
| `className` | `string` | — | Box (`<button>`) overrides |
| `disabled` | `boolean` | — | Same visual treatment as Button / Switch |

Constants: `CHECKBOX_UNCHECKED_BG`, `CHECKBOX_CHECKED_BG` in `./config`.

## Example

```tsx
import { Checkbox } from "@/components/ui/checkbox/Checkbox";

<Checkbox
  checked={listenSuccess}
  onCheckedChange={setListenSuccess}
  aria-label="Payment Success"
/>
```

## Notes

- This is the 16px box only. Wrap it with a row or `<label>` when you need visible copy.
- Do not nest a native `<input type="checkbox">`. Use `role="checkbox"` on the button.
