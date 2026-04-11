# FlagIcon

SVG sprite-based country flag icon component. Renders 249 country flags from a single sprite sheet using ISO 3166-1 alpha-2 country codes. Size is controlled entirely by the parent container's width.

## Installation

Not yet in the shadcn-vue registry. Copy `FlagIcon.vue` and `flagIcons.svg` manually:

- Component: `src/components/FlagIcon.vue`
- Sprite: `src/assets/flagIcons.svg`

## Props

```typescript
interface Props {
	country: string // ISO 3166-1 alpha-2 code (case-insensitive)
}
```

## Exported Types

```typescript
type CountryCode =
	| 'AC'
	| 'AD'
	| 'AE'
	| 'AF'
	| 'AG'
	| 'AI'
	| 'AL'
	| 'AM'
	| 'AO'
	| 'AR'
	// ... 249 codes total
	| 'XK'
	| 'YE'
	| 'YT'
	| 'ZA'
	| 'ZM'
	| 'ZW'
```

## Usage

```html
<!-- Size controlled by parent width -->
<div class="w-8">
	<FlagIcon country="NO" />
</div>

<!-- Multiple sizes -->
<div v-for="size in [16, 24, 32, 48]" :key="size" :style="{ width: size + 'px' }">
	<FlagIcon country="SE" />
</div>

<!-- Dynamic country -->
<div class="w-6">
	<FlagIcon :country="selectedCountry" />
</div>
```

## How It Works

Uses a pre-built SVG sprite sheet (`flagIcons.svg`) containing all 249 flags arranged in a 20-column grid. Each flag is 16x12px with 10px padding and 26px step. The component computes the correct `viewBox` to crop the target flag from the sprite based on the country code's index.

If the country code is not found, defaults to the first cell (`viewBox="0 0 16 12"`).

## Supported Countries

249 ISO 3166-1 alpha-2 codes including special entries:

- `EU` — European Union
- `XK` — Kosovo
- `AC` — Ascension Island
- `TA` — Tristan da Cunha

## Common Patterns

```html
<!-- Inline with text -->
<div class="flex items-center gap-2">
	<div class="w-5">
		<FlagIcon :country="user.countryCode" />
	</div>
	<span>{{ user.countryName }}</span>
</div>

<!-- In a select/combobox option -->
<div class="flex items-center gap-2">
	<div class="w-4">
		<FlagIcon :country="option.code" />
	</div>
	<span>{{ option.code }} — {{ option.name }}</span>
</div>

<!-- Grid of flags -->
<div class="grid grid-cols-6 gap-3">
	<div v-for="flag in flags" :key="flag.code" class="flex flex-col items-center gap-1">
		<div class="w-8">
			<FlagIcon :country="flag.code" />
		</div>
		<span class="text-xs text-muted-foreground">{{ flag.code }}</span>
	</div>
</div>
```

## Notes

- No slots or emits — pure display component
- Case-insensitive: `"no"`, `"NO"`, `"No"` all work
- Renders as block-level SVG — width is 100% of parent
- Single HTTP request for all flags (sprite sheet)
