# Card

Path: `src/components/ui/card/Card.tsx`

Generic surface. Dialog, Drawer, and Table reuse these defaults.

## Defaults

- `border-radius: 14px` below `md`, `20px` from `md` up
- `border: 1px solid #FFF`
- `background: #FDFDFD`
- `box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.06)`
- `padding: 16px` below `md`, `20px` from `md` up

`className` is merged last and can override any default.

## Props

Extends `HTMLAttributes<HTMLDivElement>`.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `className` | `string` | — | Tailwind merge via `cn()` |
| ...rest | div attributes | — | Spread onto the root |

## Example

```tsx
import { Card } from "@/components/ui/card/Card";

<Card className="w-full max-w-[480px]">
  Content
</Card>
```
