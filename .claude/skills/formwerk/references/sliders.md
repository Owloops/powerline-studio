# Sliders

Sliders let users select a value from within a given range via a draggable thumb on a track.

## Features

- Labeling, descriptions, error messages automatically linked with `aria-*` attributes
- `v-model` support for single and multi-thumb sliders
- Multi-thumb support with auto value clamping
- `min`, `max`, `step` attributes
- Horizontal and vertical orientations
- LTR and RTL direction support
- Validation with Standard Schema
- Clicking the track sets the value to the clicked position
- Dragging the thumb changes the value

### Keyboard Interactions

| Key         | Description                          |
| ----------- | ------------------------------------ |
| Right Arrow | Increments value (decrements in RTL) |
| Left Arrow  | Decrements value (increments in RTL) |
| Up Arrow    | Increments value                     |
| Down Arrow  | Decrements value                     |
| Home        | Sets value to minimum                |
| End         | Sets value to maximum                |
| Page Up     | Increments by a large step           |
| Page Down   | Decrements by a large step           |

## Anatomy

- **Label** - describes the slider
- **Output** - displays current value
- **Track** - the bar/rail the thumb moves along
- **Thumb** - draggable handle(s)
- **Group** - wrapping container

## Building Components

### Thumb Component

```vue
<template>
	<div v-bind="thumbProps" class="thumb">
		<div class="tooltip">{{ currentValue }}</div>
	</div>
</template>

<script setup lang="ts">
import { useSliderThumb, type SliderThumbProps } from '@formwerk/core'

const props = defineProps<SliderThumbProps>()
const { thumbProps, currentValue } = useSliderThumb(props)
</script>
```

### Slider Component

```vue
<script setup lang="ts">
import { useSlider, type SliderProps } from '@formwerk/core'
import Thumb from './Thumb.vue'

const props = defineProps<SliderProps>()
const { trackProps, groupProps, labelProps, errorMessage, errorMessageProps, useThumbMetadata } =
	useSlider(props)

const thumbData = useThumbMetadata(0)
</script>

<template>
	<div class="slider" v-bind="groupProps">
		<div v-bind="labelProps" class="slider-label">{{ label }}</div>
		<div v-bind="trackProps" class="track">
			<Thumb />
		</div>
		<div v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

The track fill width can be set via CSS using `v-bind('thumbData.percent')`:

```css
.track::before {
	content: '';
	width: calc(v-bind('thumbData.percent') * 100%);
	background-color: #10b981;
	border-radius: 6px;
	height: 6px;
}
```

### Basic Usage

```vue
<script setup lang="ts">
import Slider from './Slider.vue'
</script>

<template>
	<Slider label="Volume" />
</template>
```

## Validation

### Standard Schema

```vue
<script setup lang="ts">
import { z } from 'zod'
import Slider from './Slider.vue'

const schema = z.number('Required').min(30).max(80)
</script>

<template>
	<Slider label="Volume" :schema="schema" />
</template>
```

## Usage Examples

### Multiple Thumbs

Pass an array to `v-model` and render multiple `<Thumb />` components:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MultipleSlider from './MultipleSlider.vue'

const value = ref([10, 30])
</script>

<template>
	<MultipleSlider label="Multiple Slider" v-model="value" />
</template>
```

MultipleSlider uses `useThumbMetadata(0)` and `useThumbMetadata(1)` for positioning the track fill between thumbs:

```vue
<script setup lang="ts">
import { useSlider, type SliderProps } from '@formwerk/core'
import Thumb from './Thumb.vue'

const props = defineProps<SliderProps>()
const { trackProps, groupProps, labelProps, errorMessage, errorMessageProps, useThumbMetadata } =
	useSlider(props)

const t1 = useThumbMetadata(0)
const t2 = useThumbMetadata(1)
</script>

<template>
	<div class="slider" v-bind="groupProps">
		<div v-bind="labelProps">{{ label }}</div>
		<div v-bind="trackProps" class="track">
			<Thumb />
			<Thumb />
		</div>
		<div v-if="errorMessage" v-bind="errorMessageProps">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

Range fill CSS for multi-thumb:

```css
.track::before {
	content: '';
	width: calc((v-bind('t2.sliderPercent') - v-bind('t1.sliderPercent')) * 100%);
	background-color: #10b981;
	border-radius: 6px;
	height: 6px;
	translate: calc(v-bind('t1.sliderPercent') * var(--track-width)) 0;
}
```

### Disabled

```vue
<Slider label="Disabled Slider" v-model="value" disabled />
```

Individual thumbs can be disabled by passing `disabled` to them, but this won't prevent validation/submission.

### Readonly

```vue
<Slider label="Readonly Slider" v-model="value" readonly />
```

Readonly sliders are validated and submitted, but do not accept user input. Thumbs remain focusable.

### RTL

```vue
<Slider label="RTL Slider" v-model="value" dir="rtl" />
```

### Vertical Orientation

```vue
<Slider label="Vertical Slider" v-model="value" orientation="vertical" />
```

Formwerk handles interaction and thumb positioning for both orientations, but layout styling is your responsibility.

### Discrete Slider Values

```vue
<script setup lang="ts">
import Slider from './Slider.vue'

const options = ['Bad', 'Poor', 'Okay', 'Good', 'Great']
</script>

<template>
	<Slider label="Discrete Slider" :options="options" />
</template>
```

When `options` is used, min/max are set to first/last option, step is calculated automatically. The `step` prop is ignored when `options` is provided.

### Generic Types

```vue
<script setup lang="ts" generic="TValue">
import { useSlider, type SliderProps } from '@formwerk/core'

const props = defineProps<SliderProps<TValue>>()
</script>
```

## Styling

### Critical Style Properties (DO NOT override)

**`trackProps`:**

- `container-type`: set to `size` or `inline-size` depending on orientation
- `position`: set to `relative` (can override to anything except `static`)

**`thumbProps`:**

- `position`: set to `absolute`
- `translate`: used for positioning
- `will-change`: set to `translate`
- Inset properties (`top`, `left`, `right`, `bottom`): set to `0`

### Attributes for CSS Selectors

- `aria-orientation` on thumb and slider elements matches the slider orientation

## API Reference

### useSliderThumb

#### Props

| Name          | Type                        | Description                          |
| ------------- | --------------------------- | ------------------------------------ |
| `disabled`    | `boolean`                   | Whether the thumb is disabled        |
| `formatValue` | `(value: TValue) => string` | Format function for `aria-valuetext` |
| `label`       | `string`                    | Label text for the thumb             |
| `modelValue`  | `TValue`                    | v-model value                        |

#### Returns

| Name           | Type               | Description                    |
| -------------- | ------------------ | ------------------------------ |
| `currentText`  | `Ref<string>`      | Formatted value of the thumb   |
| `currentValue` | `Ref<TValue>`      | Current value                  |
| `isDisabled`   | `Ref<boolean>`     | Whether disabled               |
| `isDragging`   | `Ref<boolean>`     | Whether being dragged          |
| `thumbEl`      | `Ref<HTMLElement>` | Thumb element ref              |
| `thumbProps`   | `Ref<object>`      | Props to bind on thumb element |

### useSlider

#### Props

| Name          | Type                         | Description            |
| ------------- | ---------------------------- | ---------------------- |
| `schema`      | `StandardSchema`             | Validation schema      |
| `label`       | `string`                     | Label text             |
| `orientation` | `'horizontal' \| 'vertical'` | Slider orientation     |
| `dir`         | `'ltr' \| 'rtl'`             | Text direction         |
| `min`         | `number`                     | Minimum value          |
| `max`         | `number`                     | Maximum value          |
| `step`        | `number`                     | Step increment         |
| `options`     | `TValue[]`                   | Discrete value options |
| `disabled`    | `boolean`                    | Whether disabled       |
| `readonly`    | `boolean`                    | Whether readonly       |
| `modelValue`  | `TValue \| TValue[]`         | v-model value          |

#### Returns

| Name                 | Type                                                       | Description                                     |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| `controlId`          | `string`                                                   | Unique control identifier                       |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Props for description element                   |
| `errorMessage`       | `Ref<string>`                                              | Error message                                   |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                               | Props for error message element                 |
| `errors`             | `Ref<object>`                                              | Field errors                                    |
| `field`              | `FieldState<Arrayable<TValue>>`                            | Field state                                     |
| `fieldValue`         | `Ref<TValue>`                                              | Current field value                             |
| `groupProps`         | `Ref<object>`                                              | Props for group element                         |
| `isBlurred`          | `Ref<boolean>`                                             | Whether blurred                                 |
| `isDirty`            | `Ref<boolean>`                                             | Whether dirty                                   |
| `isDisabled`         | `Ref<boolean>`                                             | Whether disabled                                |
| `isTouched`          | `Ref<boolean>`                                             | Whether touched                                 |
| `isValid`            | `Ref<boolean>`                                             | Whether valid                                   |
| `isValidated`        | `Ref<boolean>`                                             | Whether validated                               |
| `labelProps`         | `Ref<AriaLabelProps>`                                      | Props for label element                         |
| `outputProps`        | `object`                                                   | Props for output element (includes `aria-live`) |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blurred state                               |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set errors                                      |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validated state                             |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state                               |
| `setValue`           | `(value: Arrayable<TValue>) => void`                       | Set value                                       |
| `submitErrorMessage` | `Ref<string>`                                              | Error from last submit                          |
| `submitErrors`       | `Ref<object>`                                              | Errors from last submit                         |
| `trackEl`            | `Ref<HTMLElement>`                                         | Track element ref                               |
| `trackProps`         | `Ref<object>`                                              | Props for track element                         |
| `useThumbMetadata`   | `(index: number) => Ref<ThumbMetadata>`                    | Get metadata for thumb at index                 |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate the field                              |

### useThumbMetadata Returns

| Name            | Type     | Description                                      |
| --------------- | -------- | ------------------------------------------------ |
| `max`           | `number` | Max value of this thumb's range                  |
| `min`           | `number` | Min value of this thumb's range                  |
| `percent`       | `number` | Percent position of this thumb (0-1)             |
| `sliderMax`     | `number` | Max value of the entire slider                   |
| `sliderMin`     | `number` | Min value of the entire slider                   |
| `sliderPercent` | `number` | Percent position relative to entire slider (0-1) |
| `value`         | `number` | Current numeric value                            |
