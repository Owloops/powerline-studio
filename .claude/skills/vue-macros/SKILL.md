---
name: vue-macros
description: Vue Macros additional compiler macros for Vue — defineModels, defineProps enhancements, shortVmodel, shortEmits, defineOptions, Vite plugin config
---

# Vue Macros

Additional macros and syntax sugar for Vue. Extends `<script setup>` with experimental features beyond what Vue core provides. Supports Vue 2.7 and Vue 3 with full TypeScript and Volar integration.

**Package:** `vue-macros` (renamed from `unplugin-vue-macros`)

## Installation

```bash
pnpm add -D vue-macros
```

### Vite Config

Vue Macros **wraps** the Vue plugin — do not use both:

```ts
// vite.config.ts
import Vue from '@vitejs/plugin-vue'
import VueMacros from 'vue-macros/vite'

export default defineConfig({
	plugins: [
		VueMacros({
			plugins: {
				vue: Vue(),
				// vueJsx: VueJsx(),       // if needed
				// vueRouter: VueRouter(),  // if needed
			},
		}),
	],
})
```

### TypeScript Support

```jsonc
// tsconfig.json
{
	"compilerOptions": {
		"types": ["vue-macros/macros-global"],
	},
}
```

### Volar Support

```jsonc
// tsconfig.json
{
	"vueCompilerOptions": {
		"plugins": ["vue-macros/volar"],
	},
}
```

### Configuration File

```ts
// vue-macros.config.ts
import { defineConfig } from 'vue-macros'

export default defineConfig({
	// enable/disable individual macros
	defineModels: true,
	shortVmodel: true,
	definePropsRefs: false,
})
```

## Macros Now in Vue Core (3.3+)

These macros were adopted into Vue 3.3+ and are **automatically disabled** when Vue >= 3.3:

### defineOptions

Declare component options (name, inheritAttrs) without a separate `<script>` block:

```vue
<script setup lang="ts">
defineOptions({
	name: 'MyComponent',
	inheritAttrs: false,
})
</script>
```

### defineSlots

Type-safe slot definitions:

```vue
<script setup lang="ts">
const slots = defineSlots<{
	default: (props: { item: string }) => any
	header: () => any
}>()
</script>
```

### shortEmits

Shorter emit type syntax (Vue 3.3 adopted the tuple syntax):

```vue
<script setup lang="ts">
// Vue core syntax (3.3+)
const emit = defineEmits<{
	change: [id: number]
	update: [value: string]
}>()
</script>
```

## Stable Macros (Vue Macros only)

### defineModels

Enhanced two-way binding — multiple v-models with less boilerplate:

```vue
<script setup lang="ts">
const { modelValue, count } = defineModels<{
	modelValue: string
	count: number
}>()

// modelValue and count are Refs — read/write directly
modelValue.value = 'hello'
count.value++
</script>

<!-- Parent usage -->
<MyComponent v-model="name" v-model:count="total" />
```

### defineProps (enhanced)

Destructured props with reactivity:

```vue
<script setup lang="ts">
// Destructure with defaults — keeps reactivity
const { name = 'World', count = 0 } = defineProps<{
	name?: string
	count?: number
}>()
</script>
```

**Note:** Vue 3.5+ added native destructured props with defaults. If on Vue 3.5+, you may not need this macro.

### definePropsRefs

Props returned as individual refs instead of a reactive object:

```vue
<script setup lang="ts">
const { name, count } = definePropsRefs<{
	name: string
	count: number
}>()
// name.value, count.value — individual Refs
</script>
```

### defineRender

Define render function in `<script setup>`:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

defineRender(
	<div>
		<span>{count.value}</span>
		<button onClick={() => count.value++}>+1</button>
	</div>,
)
</script>
```

### shortVmodel

Use `::` or `$` as shorthand for `v-model`:

```vue
<!-- shortVmodel syntax -->
<input ::value="msg" />
<!-- Equivalent to -->
<input v-model:value="msg" />

<!-- Default v-model shorthand -->
<input $="msg" />
<!-- Equivalent to -->
<input v-model="msg" />
```

## Experimental Macros

### defineProp (singular)

Define a single prop at a time:

```vue
<script setup lang="ts">
const name = defineProp<string>('name', { required: true })
const count = defineProp<number>('count', { default: 0 })
// name.value, count.value
</script>
```

### defineEmit (singular)

Define a single emit at a time:

```vue
<script setup lang="ts">
const increment = defineEmit<[value: number]>('increment')
increment(1) // type-safe emit call
</script>
```

### setupComponent

Define components without SFC — pure TypeScript:

```ts
export const MyComponent = setupComponent(
	() => {
		const count = ref(0)
		return { count }
	},
	{
		render() {
			return h('div', this.count)
		},
	},
)
```

### chainCall

Chain `defineProps`, `defineEmits` calls:

```vue
<script setup lang="ts">
const props = defineProps<{ foo: string }>().withDefaults({ foo: 'bar' })
</script>
```

### defineStyleX

Integration with Meta's StyleX CSS-in-JS:

```vue
<script setup lang="ts">
defineStyleX({
	root: { color: 'red' },
})
</script>
```

## Summary: What Lives Where

| Macro                    | Status              | Notes                            |
| ------------------------ | ------------------- | -------------------------------- |
| `defineOptions`          | Vue 3.3 core        | No longer needed from vue-macros |
| `defineSlots`            | Vue 3.3 core        | No longer needed from vue-macros |
| `shortEmits`             | Vue 3.3 core        | Tuple syntax adopted in core     |
| `defineModels`           | Stable (vue-macros) | Enhanced multi v-model sugar     |
| `defineProps` (enhanced) | Stable              | Vue 3.5 added native destructure |
| `definePropsRefs`        | Stable              | Props as individual refs         |
| `defineRender`           | Stable              | Render function in setup         |
| `shortVmodel`            | Stable              | `::` / `$` shorthand             |
| `defineProp`             | Experimental        | Single prop definition           |
| `defineEmit`             | Experimental        | Single emit definition           |
| `setupComponent`         | Experimental        | SFC-less components              |
| `chainCall`              | Experimental        | Method chaining on macros        |
| `defineStyleX`           | Experimental        | StyleX integration               |

## Gotchas

- Vue Macros **wraps** the Vue Vite plugin — pass `Vue()` inside `plugins.vue`, not alongside VueMacros
- Macros already in Vue core (3.3+) are auto-disabled — no conflicts
- `defineModels` is different from Vue's built-in `defineModel` (singular) — different API
- Experimental macros may have breaking changes — use at your own risk
- Some macros require Volar plugin for full IDE support
- The package was renamed from `unplugin-vue-macros` to `vue-macros` in Feb 2025
