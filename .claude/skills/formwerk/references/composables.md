# Composables

All composables are imported from `@formwerk/core`.

## Field Composables

| Composable                         | Description                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `useTextField`                     | Allows users to enter plain text                                              |
| `useSearchField`                   | Allows users to enter a search query, submit it, or clear it                  |
| `useNumberField`                   | Allows users to enter, increment, or decrement a number value with formatting |
| `useSwitch`                        | Allows users to toggle between two states                                     |
| `useRadioGroup` / `useRadioButton` | Allows users to select a single item from a group of options                  |
| `useCheckbox` / `useCheckboxGroup` | Allows users to select one or more items from a group of options              |
| `useSelect`                        | Allows users to display a collapsible list of options that they can search    |
| `useComboBox`                      | Searchable text inputs with a dropdown list of options for quick selection    |
| `useSlider`                        | Allows users to select one or more values from a range of values              |
| `useCalendar`                      | Allows users to select a date from a calendar                                 |
| `useDateField`                     | Allows users to enter a date                                                  |
| `useTimeField`                     | Allows users to enter a time                                                  |
| `useFileField`                     | Allows users to upload files                                                  |
| `useOtpField`                      | Allows users to enter a one-time password                                     |
| `useHiddenField`                   | For server-relevant values like tokens or IDs (not rendered visually)         |
| `useCustomField`                   | For unconventional controls or wrapping third-party components                |

## Form Management Composables

| Composable        | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `useForm`         | Validates and submits data to the server                                 |
| `useFormGroup`    | Groups related fields together                                           |
| `useFormRepeater` | Organizes multiple field groups (dynamic arrays of fields)               |
| `useSteppedForm`  | Navigate through a form in a linear or non-linear way divided into steps |

## Pattern

Each field composable:

1. Accepts a props object (with a corresponding exported `*Props` type)
2. Returns binding objects to spread onto template elements via `v-bind`
3. Handles accessibility (ARIA), keyboard interaction, validation, and value tracking automatically

```ts
import { useTextField, type TextFieldProps } from '@formwerk/core'
// Each composable has a matching Props type: TextFieldProps, NumberFieldProps, etc.
```
