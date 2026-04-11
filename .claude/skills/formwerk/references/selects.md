# Select Fields

Select fields enable users to choose one or more options from a list with enhanced styling, accessibility, and keyboard navigation.

## Features

- Automatic linking of labeling, descriptions, and error messages via `aria-*` attributes
- Single/multiple selection support
- Option group support
- Option searching with starting characters
- First-class support for `[popover]` popups
- Generic typing for options
- Native HTML constraints and Standard Schema validation
- `v-model` binding support

## Keyboard Shortcuts

**Trigger focused (menu closed):**

| Key                                 | Function   |
| ----------------------------------- | ---------- |
| Space / Enter / ArrowDown / ArrowUp | Opens menu |

**Option focused (menu open):**

| Key                             | Function                                  |
| ------------------------------- | ----------------------------------------- |
| Space / Enter                   | Selects option (toggles in multiple mode) |
| ArrowDown / ArrowUp             | Navigate options                          |
| Shift+ArrowDown / Shift+ArrowUp | Focus and select                          |
| Home / End                      | Jump to first/last option                 |
| Shift+Home / Shift+End          | Select range (multiple mode)              |
| Cmd+A                           | Select/deselect all (multiple mode)       |

## Anatomy

- **Trigger:** Opens menu, displays selected value
- **Listbox:** Options container
- **Option:** Individual selectable item
- **Option Group:** Categorized option container

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

Style with `&[aria-selected='true']` (single-select) or `&[aria-checked='true']` (multi-select), `&[aria-disabled='true']`.

### Select Component

```vue
<script setup lang="ts">
import { useId } from 'vue'
import { useSelect, type SelectProps } from '@formwerk/core'

const props = defineProps<SelectProps>()
const id = useId()
const triggerId = `--trigger-${id}`

const {
	triggerProps,
	labelProps,
	errorMessageProps,
	isTouched,
	errorMessage,
	fieldValue,
	listBoxProps,
} = useSelect(props)
</script>

<template>
	<div class="select">
		<div v-bind="labelProps" class="select-label">{{ label }}</div>

		<div v-bind="triggerProps" class="trigger">
			<div v-if="multiple && fieldValue?.length" class="multi-value-display">
				<span v-for="selected in fieldValue">{{ selected }}</span>
			</div>
			<span v-else class="placeholder">
				{{ fieldValue?.length ? fieldValue : 'Pick a value' }}
			</span>

			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256">
				<path
					d="M181.66,170.34a8,8,0,0,1,0,11.32l-48,48a8,8,0,0,1-11.32,0l-48-48a8,8,0,0,1,11.32-11.32L128,212.69l42.34-42.35A8,8,0,0,1,181.66,170.34Zm-96-84.68L128,43.31l42.34,42.35a8,8,0,0,0,11.32-11.32l-48-48a8,8,0,0,0-11.32,0l-48,48A8,8,0,0,0,85.66,85.66Z"
				></path>
			</svg>
		</div>

		<div v-bind="listBoxProps" popover class="listbox">
			<slot />
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

Key implementation details:

- Use `anchor-name` on the trigger and `position-anchor` on the listbox for CSS Anchor Positioning
- Use `popover` attribute on the listbox for native popover behavior
- Use `position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline` for smart positioning

### Option Group Component

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

## Validation

### HTML Constraints

Only `required` (boolean) is supported.

```vue
<SelectField label="Select a drink" required>
  <OptionItem label="Coffee" value="coffee" />
  <OptionItem label="Tea" value="tea" />
  <OptionItem label="Milk" value="milk" />
</SelectField>
```

### Standard Schema Validation

```vue
<script setup lang="ts">
import { z } from 'zod'

const schema = z.string().min(1, 'Please select a drink').endsWith('coffee', 'WRONG ANSWER!')
</script>

<template>
	<SelectField label="Select a drink" :schema="schema">
		<OptionItem label="Coffee" value="coffee" />
		<OptionItem label="Tea" value="tea" />
		<OptionItem label="Milk" value="milk" />
	</SelectField>
</template>
```

### Mixed Validation

HTML constraints validate first; Standard Schema validates after constraints pass.

```vue
<script setup lang="ts">
import { z } from 'zod'
const schema = z.string().endsWith('coffee', 'WRONG ANSWER!')
</script>

<template>
	<SelectField label="Select a drink" required :schema="schema">
		<OptionItem label="Coffee" value="coffee" />
		<OptionItem label="Tea" value="tea" />
		<OptionItem label="Milk" value="milk" />
	</SelectField>
</template>
```

## Usage

### Multiple Select

```vue
<script setup lang="ts">
const groups = [
	{ label: 'Africa', options: ['Egypt', 'Nigeria', 'Ghana', 'Kenya'] },
	{ label: 'Asia', options: ['China', 'India', 'Japan'] },
	{ label: 'Europe', options: ['France', 'Germany', 'Italy'] },
	{ label: 'North America', options: ['Canada', 'Mexico', 'United States'] },
	{ label: 'South America', options: ['Argentina', 'Brazil', 'Chile'] },
]
</script>

<template>
	<SelectField label="Pick countries" multiple>
		<OptionGroup v-for="group in groups" :key="group.label" :label="group.label">
			<OptionItem
				v-for="country in group.options"
				:key="country"
				:label="country"
				:value="country"
			/>
		</OptionGroup>
	</SelectField>
</template>
```

### Disabled

Disabled fields are not validated or submitted.

```vue
<SelectField label="Pick a drink" disabled>
  <OptionItem label="Coffee" value="coffee" />
  <OptionItem label="Tea" value="tea" />
  <OptionItem label="Milk" value="milk" />
</SelectField>
```

### Disabled Individual Options

Disabled options are skipped in focus and search.

```vue
<SelectField label="Pick a drink">
  <OptionItem label="Coffee" value="coffee" />
  <OptionItem label="Tea" disabled value="tea" />
  <OptionItem label="Milk" value="milk" />
</SelectField>
```

### Readonly

Readonly fields are validated and submitted but don't accept user input.

```vue
<SelectField label="Pick a drink" readonly>
  <OptionItem label="Coffee" value="coffee" />
  <OptionItem label="Tea" value="tea" />
  <OptionItem label="Milk" value="milk" />
</SelectField>
```

## Styling Notes

- Single-select: Selected options get `aria-selected="true"`
- Multi-select: Selected options get `aria-checked="true"`
- Trigger: `aria-expanded` reflects popover state, `aria-activedescendant` points to focused option
- ListBox: `aria-multiselectable` present on multi-select listboxes

## API Reference

### useOption Props

| Name       | Type      | Description                      |
| ---------- | --------- | -------------------------------- |
| `disabled` | `boolean` | Whether the option is disabled   |
| `label`    | `string`  | Label text                       |
| `value`    | `TValue`  | Value associated with the option |

### useOption Returns

| Name          | Type                  | Description              |
| ------------- | --------------------- | ------------------------ |
| `isDisabled`  | `Ref<boolean>`        | Whether disabled         |
| `isSelected`  | `Ref<boolean>`        | Whether selected         |
| `optionEl`    | `Ref<OptionElement>`  | Element reference        |
| `optionProps` | `Ref<OptionDomProps>` | Props for option element |

### useOptionGroup Props

| Name       | Type      | Description                   |
| ---------- | --------- | ----------------------------- |
| `disabled` | `boolean` | Whether the group is disabled |
| `label`    | `string`  | Label text                    |

### useOptionGroup Returns

| Name         | Type                  | Description             |
| ------------ | --------------------- | ----------------------- |
| `groupEl`    | `Ref<HTMLElement>`    | Element reference       |
| `groupProps` | `Ref<GroupDomProps>`  | Props for group element |
| `isDisabled` | `Ref<boolean>`        | Whether disabled        |
| `labelProps` | `Ref<AriaLabelProps>` | Props for label element |

### useSelect Returns

| Name                 | Type                                              | Description                     |
| -------------------- | ------------------------------------------------- | ------------------------------- |
| `controlId`          | `string`                                          | Field identifier                |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                       | Props for description element   |
| `errorMessage`       | `Ref<string>`                                     | Current error message           |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                      | Props for error message element |
| `errors`             | `Ref<{}>`                                         | Field errors object             |
| `field`              | `FieldState`                                      | Full field state                |
| `fieldValue`         | `Ref<TValue>`                                     | Current field value             |
| `isBlurred`          | `Ref<boolean>`                                    | Whether field is blurred        |
| `isDirty`            | `Ref<boolean>`                                    | Whether field is dirty          |
| `isDisabled`         | `Ref<boolean>`                                    | Whether field is disabled       |
| `isPopupOpen`        | `Ref<boolean>`                                    | Whether popup is open           |
| `isTouched`          | `Ref<boolean>`                                    | Whether field is touched        |
| `isValid`            | `Ref<boolean>`                                    | Whether field is valid          |
| `isValidated`        | `Ref<boolean>`                                    | Whether field is validated      |
| `labelProps`         | `Ref<AriaLabelProps>`                             | Props for label element         |
| `listBoxEl`          | `Ref<HTMLElement>`                                | Listbox element reference       |
| `listBoxProps`       | `Ref<ListBoxDomProps>`                            | Props for listbox element       |
| `model`              | `Ref<TValue>`                                     | Field model value               |
| `selectedOption`     | `Ref<ListOption<TValue>>`                         | Currently selected option       |
| `selectedOptions`    | `Ref<{}>`                                         | All selected options            |
| `setBlurred`         | `(blurred: boolean) => void`                      | Set blurred state               |
| `setErrors`          | `(messages: string[]) => void`                    | Set error messages              |
| `setIsValidated`     | `(isValidated: boolean) => void`                  | Set validated state             |
| `setTouched`         | `(touched: boolean) => void`                      | Set touched state               |
| `setValue`           | `(value: TValue) => void`                         | Set field value                 |
| `submitErrorMessage` | `Ref<string>`                                     | Last submit error               |
| `submitErrors`       | `Ref<{}>`                                         | Last submit errors              |
| `triggerProps`       | `Ref<SelectTriggerDomProps>`                      | Props for trigger element       |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult>` | Validate field                  |
