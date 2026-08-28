# InputNumber

Path: `src/components/ui/input-number/InputNumber.tsx`

Native text `<input>` with `inputMode="decimal"`. On change it strips non-digit characters except `.`, keeps a single decimal point, removes leading zeros (`01` → `1`), and rejects a lone `.`. `type` is always `"text"`.

Unstyled: callers supply layout and typography through `className` and the rest of the native input attributes.

## Props

Extends `InputHTMLAttributes<HTMLInputElement>` (`onChange` still fires with the sanitized event).

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `onNumberChange` | `(value: string) => void` | — | Sanitized string after the same filters |
| `decimals` | `number` | — | When set, truncates digits after the decimal point |
| `className` | `string` | — | Forwarded to the input |

`value` / `defaultValue` stay under caller control. This component does not parse to `number` (avoid precision loss).

## Example

```tsx
import { InputNumber } from "@/components/ui/input-number/InputNumber";

<InputNumber
  value={amount}
  decimals={2}
  onNumberChange={setAmount}
  placeholder="0.00"
  className="w-full"
/>
```
