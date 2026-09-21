# Toast

Path: `src/components/ui/toast/Toast.tsx`
Hook: `src/hooks/use-toast.tsx`

Notification card rendered inside `react-toastify`. Call the `useToast()` hook; do not import `react-toastify` or the `Toast` component from a feature.

The `ToastContainer` lives in `src/App.tsx` (bottom-right, no progress bar, transparent wrapper, oldest toward the top, no default close button). The hook positions each toast bottom-right with the `decash-toast decash-toast-bottom-right` class; the matching styles are in `src/styles.css`. The container `z-index` is `100000001` so a toast stays above the near-connect wallet popup (`100000000`). New toasts sit at the bottom of the stack; earlier ones move up.

Status glyphs use public icons (`IconCheck`, `IconClose`, `IconAlert`, `IconLoading`) inside a 14px colored circle.

## `useToast()`

Default `autoClose` is `3000` ms unless `duration` is passed (`false` keeps the toast open).

| Method | `ToastType` | Notes |
| --- | --- | --- |
| `success` | `success` | Green `#84a20f` check |
| `fail` | `error` | Danger close |
| `info` | `info` | Blue `#007AFF` alert |
| `loading` | `pending` | Orange spinner |
| `notice` | `notice` | Gray alert |
| `dismiss` | — | `toast.dismiss` from react-toastify |

Each show method takes `{ title, text?, duration?, onClose? }` and returns a `ToastHandle` (`id`, `update`, `dismiss`). `title` and `text` are `ReactNode`.

## Toast props

Used by the hook. Feature code should not render `<Toast>` directly.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | `ToastType` | required | Visual glyph |
| `title` | `ReactNode` | required | |
| `text` | `ReactNode` | — | Secondary line |
| `className` | `string` | — | Root card |
| `closeToast` | `() => void` | — | Injected by react-toastify |

Card defaults: 316px wide (`calc(100vw - 32px)` below `md`), `#fdfdfd`, `border #e0e0e0`, 12px radius, shadow `0 0 20px 0 rgba(0,0,0,0.06)`, Montserrat 14px semibold black title.

## Example

```tsx
import useToast from "@/hooks/use-toast";

const toast = useToast();

toast.success({ title: "Saved" });
toast.fail({ title: "Request failed", text: "Try again." });
toast.loading({ title: "Sending…", duration: false });
toast.dismiss();
```
