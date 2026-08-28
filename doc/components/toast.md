# Toast

Path: `src/components/ui/toast/Toast.tsx`

Call from feature code through `src/hooks/use-toast.tsx` (`useToast()`). Do not import `react-toastify` in views. `ToastContainer` is mounted once in `App`.

Card: 288px wide (`w-72`), `calc(100vw - 32px)` below `md`, white, 12px radius, shadow `0 0 6px 0 rgba(0,0,0,0.10)`. Title is Space Grotesk 14px `#444C59`; optional `text` is 12px light. Type glyphs and the close mark live inside this file — do not extract them into `src/components/icons/`.

`ToastType` is a `const` object (`success` / `error` / `info` / `pending` / `notice`). Pending uses `IconProcessing` with `animate-spin`.

## `useToast()`

Default position `top-right`. `autoClose` is `3000` ms unless `duration` is passed (`false` keeps the toast open).

| Method | `ToastType` | Notes |
| --- | --- | --- |
| `success` | `success` | Green check |
| `fail` | `error` | Pink close |
| `info` | `info` | Blue info |
| `loading` | `pending` | Spinning `IconProcessing` |
| `notice` | `notice` | Yellow speaker |
| `dismiss` | — | `toast.dismiss` from react-toastify |

Each show method takes `{ title, text?, duration? }` and returns the toast id.

## Toast props

Used by the hook. Feature code should not render `<Toast>` directly.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | `ToastType` | required | Visual glyph |
| `title` | `string` | required | |
| `text` | `string` | — | Secondary line |
| `className` | `string` | — | Root card |
| `closeToast` | `() => void` | — | Injected by react-toastify |

## Example

```tsx
import useToast from "@/hooks/use-toast";

const toast = useToast();

toast.success({ title: "Saved" });
toast.fail({ title: "Request failed", text: "Try again." });
toast.loading({ title: "Sending…", duration: false });
toast.dismiss();
```
