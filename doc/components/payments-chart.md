# PaymentsAreaChart

Shared payments analytics area chart used by Overview and Reports.

Path: `src/components/payments-chart/PaymentsAreaChart.tsx`

This is a business widget (not a `src/components/ui/` primitive). It owns the Volume / Transaction toggle, Y-axis scaling, and X-axis category ticks.

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Card heading |
| `points` | `{ label: string; value: number }[]` | Category labels already formatted by the caller |
| `metric` | `"volume" \| "transaction"` | Selected series; drives Y-axis formatting |
| `onMetricChange` | `(metric) => void` | Volume / Transaction toggle |
| `loading` | `boolean?` | Replaces the plot with `Loading…` |
| `headerExtra` | `ReactNode?` | Extra header control (Overview period dropdown) |
| `className` | `string?` | Card override |

Constants live in `config.ts`: `CHART_METRIC`, `CHART_METRIC_OPTIONS`, `CHART_METRIC_COLOR` (Volume `#6284F5`, Transaction `#84A20F`).

Helpers in `utils.ts`:

- `chartYTicks(maxValue, { integer? })` — five-step Y domain
- `formatChartAxis(value, metric)` — `$` / `K` for volume, integers for transactions
- `evenCategoryTicks(labels, maxTicks)` — walk back from the newest point with a constant step so the last date is always labelled and gaps are even
- `maxCategoryTicks(hostWidth, minTickPx)` — how many labels fit in the plot without overlapping
- `chartXTickMinPx(labels)` — min pixels per tick from the longest label

X-axis samples evenly from the latest date. `maxTicks` comes from a ResizeObserver on the chart host, so narrower cards show fewer labels. First sampled tick is left-aligned and the last is right-aligned so edge labels are not clipped. Pass the sampled labels as Recharts `XAxis` `ticks` with `interval={0}`.

## Example

```tsx
<PaymentsAreaChart
  title="Payments"
  points={points}
  metric={metric}
  onMetricChange={setMetric}
  loading={query.isPending}
  headerExtra={<Dropdown value={period} onChange={setPeriod} options={rangeOptions} />}
/>
```
