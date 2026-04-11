# ComboBox Fields

ComboBoxes combine text fields with dropdown/listbox functionality to allow users to select options matching entered text.

## Features

- Automatic ARIA linking for labels, descriptions, and error messages
- Single selection support
- Option group support
- Multiple filtering strategies
- Popover API support for dropdowns
- Generic typing for options
- Standard Schema validation
- v-model binding
- Comprehensive keyboard navigation

## Keyboard Navigation

**Menu Closed (Input Focused):**

| Key       | Action       |
| --------- | ------------ |
| ArrowDown | Opens menu   |
| ArrowUp   | Opens menu   |
| Esc       | Clears input |

**Menu Open (Input Focused):**

| Key            | Action                     |
| -------------- | -------------------------- |
| Enter          | Selects highlighted option |
| ArrowDown      | Next option                |
| ArrowUp        | Previous option            |
| Home / PageUp  | First option               |
| End / PageDown | Last option                |
| Esc            | Closes menu                |

## Anatomy

```
ComboBox Structure:
├── Label
├── Control Container
│   ├── Input (text field)
│   └── Button (trigger)
└── Listbox Popup
    ├── Option Item(s)
    └── OptionGroup(s)
        └── Option Item(s)
```

## Building Components

### Option Component

```vue
<script setup lang="ts">
import { type OptionProps, useOption } from '@formwerk/core'
const props = defineProps<OptionProps>()
const { optionProps } = useOption(props)
</script>

<template>
	<div v-bind="optionProps" class="option">
		{{ label }}
	</div>
</template>
```

Style focused/selected options via `[aria-selected='true']` and `[aria-checked='true']`. Disabled options use `[aria-disabled='true']`.

### ComboBox Component

```vue
<script setup lang="ts">
import { useId } from 'vue'
import { useComboBox, type ComboBoxProps, useDefaultFilter } from '@formwerk/core'

const props = defineProps<ComboBoxProps>()
const id = useId()
const anchorId = `--anchor-${id}`

const { contains } = useDefaultFilter({
	caseSensitive: false,
})

const {
	buttonProps,
	inputProps,
	labelProps,
	errorMessageProps,
	errorMessage,
	listBoxProps,
	isListEmpty,
} = useComboBox(props, {
	filter: contains,
})
</script>

<template>
	<div class="combobox">
		<div v-bind="labelProps" class="combobox-label">{{ label }}</div>

		<div class="control">
			<input v-bind="inputProps" />
			<button v-bind="buttonProps">
				<!-- chevron icon -->
			</button>
		</div>

		<div v-bind="listBoxProps" popover class="listbox">
			<slot />
			<div v-if="isListEmpty" class="empty-message">No Results</div>
		</div>

		<div v-if="description" v-bind="descriptionProps" class="hint">
			{{ description }}
		</div>

		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

The listbox uses the Popover API (`popover` attribute) with CSS anchor positioning (`position-anchor`, `position-area`).

### OptionGroup Component

```vue
<script setup lang="ts">
import { type OptionGroupProps, useOptionGroup } from '@formwerk/core'

const props = defineProps<OptionGroupProps>()
const { labelProps, groupProps } = useOptionGroup(props)
</script>

<template>
	<div v-bind="groupProps" class="option-group">
		<div v-bind="labelProps" class="label">{{ label }}</div>
		<div class="options">
			<slot />
		</div>
	</div>
</template>
```

## Basic Usage

```vue
<script setup lang="ts">
import ComboBox from './ComboBox.vue'
import OptionItem from './OptionItem.vue'
</script>

<template>
	<ComboBox label="Select a drink" placeholder="Search...">
		<OptionItem label="Coffee" value="coffee" />
		<OptionItem label="Tea" value="tea" />
		<OptionItem label="Milk" value="milk" />
	</ComboBox>
</template>
```

### With Option Groups

```vue
<script setup lang="ts">
import ComboBox from './ComboBox.vue'
import OptionGroup from './OptionGroup.vue'
import OptionItem from './OptionItem.vue'

const groups = [
	{ label: 'Africa', options: ['Egypt', 'Nigeria', 'Ghana', 'Kenya'] },
	{ label: 'Asia', options: ['China', 'India', 'Japan'] },
	{ label: 'Europe', options: ['France', 'Germany', 'Italy'] },
]
</script>

<template>
	<ComboBox label="Select a country" placeholder="Search...">
		<OptionGroup v-for="group in groups" :key="group.label" :label="group.label">
			<OptionItem
				v-for="country in group.options"
				:key="country"
				:label="country"
				:value="country"
			/>
		</OptionGroup>
	</ComboBox>
</template>
```

## Validation

ComboBoxes are fully custom components and do **not** support HTML validation attributes. Use Standard Schema only.

```vue
<script setup lang="ts">
import ComboBox from './ComboBox.vue'
import OptionItem from './OptionItem.vue'
import { z } from 'zod'

const schema = z.string().min(1, 'Please select a drink').endsWith('coffee', 'WRONG ANSWER!')
</script>

<template>
	<ComboBox label="Select a drink" :schema="schema" placeholder="Search...">
		<OptionItem label="Coffee" value="coffee" />
		<OptionItem label="Tea" value="tea" />
		<OptionItem label="Milk" value="milk" />
	</ComboBox>
</template>
```

## Filtering

### useDefaultFilter

```typescript
import { useDefaultFilter } from '@formwerk/core'

const { startsWith, endsWith, equals, contains } = useDefaultFilter({
	caseSensitive: false,
	debounceMs: 300, // Optional debouncing
})
```

Available strategies: `startsWith`, `endsWith`, `equals`, `contains`.

Pass any strategy as the `filter` option to `useComboBox`.

## Usage Patterns

### Disabled Field

```vue
<ComboBox label="Pick a drink" disabled>
  <OptionItem label="Coffee" value="coffee" />
</ComboBox>
```

### Disabled Options

```vue
<ComboBox label="Pick a drink" placeholder="Search...">
  <OptionItem label="Coffee" value="coffee" />
  <OptionItem label="Tea" disabled value="tea" />
  <OptionItem label="Milk" value="milk" />
</ComboBox>
```

Disabled options are skipped from focus order when using keyboard navigation.

### Readonly

```vue
<ComboBox label="Pick a drink" readonly placeholder="Search...">
  <OptionItem label="Coffee" value="coffee" />
</ComboBox>
```

Readonly fields are validated and submitted but don't accept user input. The field is still focusable and the popup is still openable.

### Open on Focus

```vue
<ComboBox label="Pick a drink" open-on-focus placeholder="Search...">
  <OptionItem label="Coffee" value="coffee" />
</ComboBox>
```

### Custom Values

Handle the `@new-value` event to allow users to add values not in the list:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ComboBox from './ComboBox.vue'
import OptionItem from './OptionItem.vue'

const drinks = ref([
	{ value: 'coffee', label: 'Coffee' },
	{ value: 'tea', label: 'Tea' },
])

function onNewDrink(value: string) {
	const newDrink = { value, label: value }
	drinks.value.push(newDrink)
	return newDrink // Return object with value and label
}
</script>

<template>
	<ComboBox label="Select a drink" placeholder="Search..." @new-value="onNewDrink">
		<OptionItem
			v-for="drink in drinks"
			:key="drink.value"
			:label="drink.label"
			:value="drink.value"
		/>
	</ComboBox>
</template>
```

**Custom value triggers:** input doesn't match any option, input is not empty, user presses Enter or Tab.

Return `null` or `undefined` to prevent addition (e.g., for validation):

```typescript
function onNewDrink(value: string) {
	if (drinks.value.length >= 5) return null // Prevent adding
	const newDrink = { value, label: value }
	drinks.value.push(newDrink)
	return newDrink
}
```

## Styling Notes

- Focused options receive `aria-selected="true"` for CSS targeting
- Input has `aria-expanded` indicating popover state
- Input has `aria-activedescendant` when an option is focused

## API Reference

### useOption Props

| Name       | Type      | Description        |
| ---------- | --------- | ------------------ |
| `disabled` | `boolean` | Option is disabled |
| `label`    | `string`  | Display label text |
| `value`    | `TValue`  | Associated value   |

### useOption Returns

| Name          | Type                  | Description       |
| ------------- | --------------------- | ----------------- |
| `isDisabled`  | `Ref<boolean>`        | Whether disabled  |
| `isSelected`  | `Ref<boolean>`        | Whether selected  |
| `optionEl`    | `Ref<OptionElement>`  | Element reference |
| `optionProps` | `Ref<OptionDomProps>` | Binding object    |

### useOptionGroup Props

| Name       | Type      | Description        |
| ---------- | --------- | ------------------ |
| `disabled` | `boolean` | Group is disabled  |
| `label`    | `string`  | Display label text |

### useOptionGroup Returns

| Name         | Type                  | Description               |
| ------------ | --------------------- | ------------------------- |
| `groupEl`    | `Ref<HTMLElement>`    | Element reference         |
| `groupProps` | `Ref<AriaProps>`      | Binding with role/id/aria |
| `isDisabled` | `Ref<boolean>`        | Whether disabled          |
| `labelProps` | `Ref<AriaLabelProps>` | Label binding             |

### useComboBox Returns

| Name                 | Type                                              | Description                    |
| -------------------- | ------------------------------------------------- | ------------------------------ |
| `buttonEl`           | `Ref<HTMLElement>`                                | Button element reference       |
| `buttonProps`        | `Ref<ButtonDomProps>`                             | Button binding                 |
| `controlId`          | `string`                                          | Control identifier             |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                       | Description binding            |
| `errorMessage`       | `Ref<string>`                                     | Current error message          |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                      | Error message binding          |
| `errors`             | `Ref<{}>`                                         | Field errors object            |
| `field`              | `FieldState<TValue>`                              | Complete field state           |
| `fieldValue`         | `Ref<TValue>`                                     | Field value                    |
| `inputEl`            | `Ref<HTMLElement>`                                | Input element reference        |
| `inputProps`         | `Ref<InputDomProps>`                              | Input binding with events/aria |
| `inputValue`         | `Ref<string>`                                     | Input text value               |
| `isBlurred`          | `Ref<boolean>`                                    | Blurred state                  |
| `isDirty`            | `Ref<boolean>`                                    | Dirty state                    |
| `isDisabled`         | `Ref<boolean>`                                    | Disabled state                 |
| `isListEmpty`        | `Ref<boolean>`                                    | No matching options            |
| `isPopupOpen`        | `Ref<boolean>`                                    | Popup visibility               |
| `isTouched`          | `Ref<boolean>`                                    | Touched state                  |
| `isValid`            | `Ref<boolean>`                                    | Valid state                    |
| `isValidated`        | `Ref<boolean>`                                    | Has been validated             |
| `labelProps`         | `Ref<AriaLabelProps>`                             | Label binding                  |
| `listBoxEl`          | `Ref<HTMLElement>`                                | Listbox reference              |
| `listBoxProps`       | `Ref<ListBoxDomProps>`                            | Listbox binding                |
| `selectedOption`     | `Ref<ListOption<TValue>>`                         | Current selection              |
| `setBlurred`         | `(blurred: boolean) => void`                      | Set blurred state              |
| `setErrors`          | `(messages: Arrayable<string>) => void`           | Set error messages             |
| `setIsValidated`     | `(isValidated: boolean) => void`                  | Set validated state            |
| `setTouched`         | `(touched: boolean) => void`                      | Set touched state              |
| `setValue`           | `(value: TValue) => void`                         | Set field value                |
| `submitErrorMessage` | `Ref<string>`                                     | Last submit error              |
| `submitErrors`       | `Ref<{}>`                                         | Last submit errors             |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult>` | Manual validation              |

### useDefaultFilter Options

| Name            | Type      | Description                    |
| --------------- | --------- | ------------------------------ |
| `caseSensitive` | `boolean` | Case sensitivity flag          |
| `debounceMs`    | `number`  | Debounce delay in milliseconds |
