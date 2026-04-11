# Hidden Fields

Hidden fields include data that cannot be seen or modified by users when a form is submitted. Common uses: CSRF tokens, content IDs. These fields lack most features of standard fields.

## Features

- `useHiddenField` composable
- Renderless `HiddenField` component

## Usage

### HiddenField Component

```vue
<script setup lang="ts">
import { HiddenField } from '@formwerk/core'
</script>

<template>
	<HiddenField name="csrfToken" :value="csrfToken" />
</template>
```

### useHiddenField Composable

```vue
<script setup lang="ts">
import { useHiddenField, type HiddenFieldProps } from '@formwerk/core'

const props = defineProps<HiddenFieldProps>()
useHiddenField(props)
</script>

<template>
	<input type="hidden" :name="name" :value="value" />
</template>
```

### In a Form

```vue
<script setup lang="ts">
import { HiddenField, useForm } from '@formwerk/core'

const { handleSubmit } = useForm({})
const onSubmit = handleSubmit((data) => {
	alert(JSON.stringify(data.toObject(), null, 2))
})
</script>

<template>
	<form @submit="onSubmit">
		<HiddenField name="csrfToken" value="abc123xyz789" />
		<button type="submit">Submit</button>
	</form>
</template>
```

### Disabled Hidden Field

Marking a hidden field as disabled makes it non-submittable -- its value will not be included in form data:

```vue
<template>
	<form @submit="onSubmit">
		<HiddenField name="csrfToken" value="abc123xyz789" />
		<HiddenField name="disabled" value="disabled-field" disabled />
		<button type="submit">Submit</button>
	</form>
</template>
```

## Important Notes

- **No validation**: Hidden fields do not support validation because users cannot interact with them.
- **Disabled = not submitted**: A disabled hidden field's value is excluded from form data.
- **HiddenField component**: Provided as a utility for declarative value declarations, eliminating the need to create custom components for basic hidden field use cases.

## API Reference

### Props (useHiddenField / HiddenField)

| Name       | Type      | Description                                                     |
| ---------- | --------- | --------------------------------------------------------------- |
| `disabled` | `boolean` | Whether the hidden field is disabled (excluded from submission) |
| `name`     | `string`  | The name attribute for the field                                |
| `value`    | `TValue`  | The value of the hidden field                                   |

### useHiddenField Returns

| Name                 | Type                                                       | Description                     |
| -------------------- | ---------------------------------------------------------- | ------------------------------- |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                | Props for description element   |
| `errorMessage`       | `Ref<string>`                                              | Error message                   |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                               | Props for error message element |
| `errors`             | `Ref<{}>`                                                  | Field errors                    |
| `fieldValue`         | `Ref<TValue>`                                              | Current value                   |
| `isBlurred`          | `Ref<boolean>`                                             | Blurred state                   |
| `isDirty`            | `Ref<boolean>`                                             | Dirty state                     |
| `isDisabled`         | `Ref<boolean>`                                             | Disabled state                  |
| `isTouched`          | `Ref<boolean>`                                             | Touched state                   |
| `isValid`            | `Ref<boolean>`                                             | Validation state                |
| `isValidated`        | `Ref<boolean>`                                             | Whether validated               |
| `labelProps`         | `Ref<AriaLabelProps>`                                      | Props for label element         |
| `setBlurred`         | `(blurred: boolean) => void`                               | Set blurred state               |
| `setErrors`          | `(messages: Arrayable<string>) => void`                    | Set errors                      |
| `setIsValidated`     | `(isValidated: boolean) => void`                           | Set validated state             |
| `setTouched`         | `(touched: boolean) => void`                               | Set touched state               |
| `setValue`           | `(value: unknown) => void`                                 | Set value                       |
| `submitErrorMessage` | `Ref<string>`                                              | Error from last submit          |
| `submitErrors`       | `Ref<{}>`                                                  | Errors from last submit         |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult<unknown>>` | Validate field                  |
