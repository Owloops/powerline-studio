# NumberMask

Locale-aware number masking component built on the Maska library. Two modes: number mode (locale formatting) and custom mask mode (pattern-based). Includes a PercentageInput variant that stores decimals and displays percentages.

## Installation

```bash
pnpm dlx shadcn-vue@latest add @electricity-ui/mask-number-input
pnpm dlx shadcn-vue@latest add @electricity-ui/percentage-input
```

## Key Concept

Built on **Maska** library. Two modes:

- **Number mode** (default): Locale-aware formatting (e.g., Finnish `1 234,56`)
- **Custom mask mode**: Pattern-based (`+358 ## ### ####`)

## Props

| Prop            | Type                        | Default     | Description                                 |
| --------------- | --------------------------- | ----------- | ------------------------------------------- |
| `modelValue`    | Number \| null              | `null`      | Bound numeric value                         |
| `locale`        | String                      | `'fi-FI'`   | Locale for formatting                       |
| `fraction`      | Number                      | `2`         | Decimal places                              |
| `unsigned`      | Boolean                     | `false`     | Positive numbers only                       |
| `mask`          | String \| Array \| Function | `undefined` | Custom mask pattern                         |
| `placeholder`   | String                      | `undefined` | Input placeholder                           |
| `disabled`      | Boolean                     | `false`     | Disabled state                              |
| `inputClass`    | String                      | `undefined` | Additional CSS classes                      |
| `toView`        | Function                    | `undefined` | Transform value for display                 |
| `fromView`      | Function                    | `undefined` | Transform value from display                |
| `eager`         | Boolean                     | `false`     | Real-time formatting as user types          |
| `reversed`      | Boolean                     | `false`     | Input grows backwards (useful for decimals) |
| `tokens`        | Object                      | `undefined` | Custom token definitions for masking        |
| `tokensReplace` | Boolean                     | `false`     | Whether to replace tokens dynamically       |

## Usage

```html
<!-- Standard numeric input -->
<MaskNumberInput :fraction="2" locale="fi-FI" v-model="form.price" />

<!-- High precision -->
<MaskNumberInput :fraction="6" locale="fi-FI" v-model="form.energy" />

<!-- Custom mask -->
<MaskNumberInput mask="+358 ## ### ####" v-model="form.phone" />

<!-- Right-aligned currency -->
<MaskNumberInput input-class="text-right font-mono" :fraction="2" v-model="price" />
```

### Legacy UMD Registration

```javascript
app.component('electricity-numbermask', EUI.Components.NumberMask)
app.component('percentage-input', EUI.Components.PercentageInput)
```

## Percentage Component

Stores decimal (0.42), displays percentage (42%):

```html
<PercentageInput v-model="contract.taxRate" :fraction="2" locale="fi-FI" />
```

Conversion logic:

```typescript
const toViewPercent = (val) => (val !== null ? val * 100 : null)
const fromViewPercent = (val) => (val !== null ? val / 100 : null)
```

## Table Integration

```html
<td>
	<MaskNumberInput
		v-model="item.unitPrice"
		locale="fi-FI"
		:fraction="3"
		input-class="w-32 text-right border-0 bg-transparent"
	/>
</td>
```

## Styling

```html
<!-- Right-aligned currency -->
<MaskNumberInput input-class="text-right font-mono" :fraction="2" />

<!-- Compact table input -->
<MaskNumberInput class="py-1 -my-1.5" input-class="w-24 text-center" />

<!-- Conditional coloring -->
<MaskNumberInput
	v-model="bidPrice"
	:input-class="[
		'text-right',
		bidPrice > marketPrice ? 'text-red-600' : 'text-green-600'
	]"
	:fraction="4"
/>
```

## Technical Notes

### Floating-Point Precision

```typescript
const roundToFraction = (value: number, fraction: number): number => {
	const multiplier = Math.pow(10, fraction)
	return Math.round(value * multiplier) / multiplier
}
```

Prevents `0.1 + 0.2 = 0.30000000000000004` issues. Critical for financial calculations in energy trading.

### Focus Management

External value updates are skipped while the user is typing:

```typescript
watch(
	() => props.modelValue,
	async (newValue) => {
		if (hasFocus.value) return
		// Apply external updates only when input is not focused
	},
)
```

This prevents cursor position issues during editing.

### Maska Options

The `maskaOptions` computed property determines which mode runs:

```typescript
const maskaOptions = computed(() => {
	if (props.mask) {
		// Custom mask mode
		return {
			mask: props.mask,
			eager: props.eager,
			reversed: props.reversed,
			tokens: props.tokens,
			tokensReplace: props.tokensReplace,
		}
	} else {
		// Number mode
		return {
			number: {
				locale: props.locale,
				fraction: props.fraction,
				unsigned: props.unsigned,
			},
		}
	}
})
```

Applied via the `vMaska` directive on the input element.

## Troubleshooting

### Values Not Formatting Correctly

**Cause:** Incorrect locale or fraction settings.

```html
<!-- Ensure locale matches expected format -->
<MaskNumberInput locale="fi-FI" :fraction="2" />
```

### Custom Mask Not Working

**Cause:** Missing tokens or incorrect pattern.

```html
<!-- Define custom tokens if needed -->
<MaskNumberInput
	mask="AA-####-##"
	:tokens="{ A: { pattern: /[A-Z]/, transform: v => v.toUpperCase() } }"
/>
```

### Performance Problems in Large Tables

**Cause:** Too many reactive watchers. Use `:eager="false"` for large tables.
