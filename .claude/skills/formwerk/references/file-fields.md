# File Fields

File fields enable file submission/upload through input elements with drag-and-drop support, previews, and validation.

## Features

- Uses `input` element with file type
- Automatic linking of labels, descriptions, and error messages
- Native HTML constraints and Standard Schema validation
- v-model binding
- Single and multiple file selection
- Drag and drop via dropzone
- Directory picking (`allow-directory`)
- Auto previews for images and videos
- Upload handling with abort support
- File entry management (add/remove)

## Anatomy

```
├── Trigger (button to open file picker)
├── Dropzone (drag-and-drop container)
├── File Entry (individual file with preview/removal)
│   ├── Preview (img/video)
│   └── Remove Button
├── Help text
└── Error Message
```

## Building a File Field

### Simple File Field

```vue
<script setup lang="ts">
import { useFileField, type FileFieldProps } from '@formwerk/core'

const props = defineProps<FileFieldProps>()
const {
	inputProps,
	triggerProps,
	entry,
	errorMessageProps,
	errorMessage,
	remove,
	removeButtonProps,
	isUploading,
} = useFileField(props)
</script>

<template>
	<div class="field">
		<input v-bind="inputProps" class="sr-only" />

		<button v-bind="triggerProps" class="trigger">Choose a file</button>

		<p v-if="!entry" class="empty-state">No file selected</p>
		<div v-else class="file-entry">
			<span>{{ entry.file.name }}</span>
			<button v-bind="removeButtonProps" class="delete-button" @click="remove">Remove</button>
		</div>

		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

### Dropzone with Multiple Files and Previews

```vue
<script setup lang="ts">
import { useFileField, type FileFieldProps, FileEntry } from '@formwerk/core'

const props = defineProps<FileFieldProps>()
const { inputProps, dropzoneProps, triggerProps, entries, errorMessageProps, errorMessage } =
	useFileField(props)
</script>

<template>
	<div v-bind="dropzoneProps" class="dropzone">
		<input v-bind="inputProps" class="sr-only" />

		<div v-if="entries.length === 0" class="empty-state">
			<button v-bind="triggerProps" class="trigger">Choose a file</button>
			<p>No file selected</p>
		</div>

		<div v-else class="file-grid">
			<ul>
				<FileEntry
					as="li"
					v-for="entry in entries"
					v-bind="entry"
					class="file-entry"
					v-slot="{ removeButtonProps, previewProps, hasPreview }"
				>
					<component :is="previewProps.as" v-bind="previewProps" class="preview" />
					<button v-bind="removeButtonProps" class="delete-button">X</button>
					<span v-if="!hasPreview" class="filename">{{ entry.file.name }}</span>
				</FileEntry>
			</ul>
		</div>

		<div v-if="errorMessage" v-bind="errorMessageProps" class="error">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

The `FileEntry` component provides `removeButtonProps`, `previewProps`, and `hasPreview` via its slot. The `previewProps.as` is either `'img'` or `'video'` depending on file type.

## Validation

### HTML Constraints

| Property   | Type      | Description       |
| ---------- | --------- | ----------------- |
| `required` | `boolean` | Field is required |

```vue
<FileField label="File" required />
```

### Standard Schema (Zod)

```vue
<script setup lang="ts">
import { z } from 'zod'
import FileField from './FileField.vue'

const schema = z.object({
	size: z.number().max(1 * 1024 * 1024, 'Size must be less than 1MB'),
})
</script>

<template>
	<FileField label="File" :schema="schema" />
</template>
```

### Mixed Validation

```vue
<FileField label="File" :schema="schema" required />
```

HTML constraints validate first, then Standard Schema.

## Usage Patterns

### Disabled

```vue
<FileField label="Disabled" disabled />
```

### Multiple Files

```vue
<Dropzone label="Multiple Files" multiple />
```

### Directory Picking

```vue
<Dropzone label="Directory" multiple allow-directory />
```

### Uploading Files

The `@upload` event handler receives a `FileUploadContext`:

| Property | Type          | Description                   |
| -------- | ------------- | ----------------------------- |
| `file`   | `File`        | The file just picked          |
| `key`    | `string`      | Entry key containing the file |
| `signal` | `AbortSignal` | Signal for aborting upload    |

Return a string (e.g., server identifier) that replaces the File on form submission:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { type FileUploadContext } from '@formwerk/core'
import FileField from './FileField.vue'

function onUpload({ file }: FileUploadContext) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(Date.now().toString())
		}, 1000)
	})
}

const value = ref<string>()
</script>

<template>
	Field value: {{ value }}
	<FileField label="File" v-model="value" @upload="onUpload" />
</template>
```

The `isUploading` ref from `useFileField` indicates upload progress.

### Initial Data

`useFileField` does **not** currently support initial data due to browser security restrictions on file inputs.

## API Reference

### useFileField Returns

| Name                 | Type                                                                                                  | Description                       |
| -------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| `clear`              | `() => void`                                                                                          | Clear field value                 |
| `controlId`          | `string`                                                                                              | Field control ID                  |
| `descriptionProps`   | `Ref<AriaDescriptionProps>`                                                                           | Description bindings              |
| `dropzoneProps`      | `Ref<{ onDragenter, onDragover, onDragleave, onDrop, onClick, role, 'data-dragover', 'aria-label' }>` | Dropzone bindings                 |
| `entries`            | `Ref<FileEntryConfig[]>`                                                                              | All file entries                  |
| `entry`              | `Ref<{ id, file }>`                                                                                   | Single file entry                 |
| `errorMessage`       | `Ref<string>`                                                                                         | Error message                     |
| `errorMessageProps`  | `Ref<AriaErrorMessageProps>`                                                                          | Error message bindings            |
| `errors`             | `Ref<{}>`                                                                                             | Field errors                      |
| `field`              | `FieldState`                                                                                          | Complete field state              |
| `fieldValue`         | `Ref<TValue>`                                                                                         | Field value                       |
| `inputEl`            | `Ref<HTMLInputElement>`                                                                               | Input element ref                 |
| `inputProps`         | `Ref`                                                                                                 | Input element bindings            |
| `isBlurred`          | `Ref<boolean>`                                                                                        | Blur state                        |
| `isDirty`            | `Ref<boolean>`                                                                                        | Dirty state                       |
| `isDisabled`         | `Ref<boolean>`                                                                                        | Disabled state                    |
| `isDragging`         | `Ref<boolean>`                                                                                        | Drag-over state                   |
| `isTouched`          | `Ref<boolean>`                                                                                        | Touched state                     |
| `isUploading`        | `Ref<boolean>`                                                                                        | Upload in progress                |
| `isValid`            | `Ref<boolean>`                                                                                        | Valid state                       |
| `isValidated`        | `Ref<boolean>`                                                                                        | Validated state                   |
| `labelProps`         | `Ref<AriaLabelProps>`                                                                                 | Label bindings                    |
| `remove`             | `(key?: string) => void`                                                                              | Remove file entry                 |
| `removeButtonProps`  | `Ref<{ type: 'button', role, tabindex }>`                                                             | Remove button bindings            |
| `setBlurred`         | `(blurred: boolean) => void`                                                                          | Set blur state                    |
| `setErrors`          | `(messages: Arrayable<string>) => void`                                                               | Set errors                        |
| `setIsValidated`     | `(isValidated: boolean) => void`                                                                      | Set validated state               |
| `setTouched`         | `(touched: boolean) => void`                                                                          | Set touched state                 |
| `setValue`           | `(value: any) => void`                                                                                | Set value                         |
| `showPicker`         | `(opts?: FilePickerOptions) => Promise<void>`                                                         | Open file picker programmatically |
| `submitErrorMessage` | `Ref<string>`                                                                                         | Last submit error                 |
| `submitErrors`       | `Ref<{}>`                                                                                             | Last submit errors                |
| `triggerProps`       | `Ref<{ type: 'button', role, tabindex }>`                                                             | Trigger button bindings           |
| `validate`           | `(mutate?: boolean) => Promise<ValidationResult>`                                                     | Validate field                    |

### FileEntry Slot Props

| Name                | Type                         | Description                                          |
| ------------------- | ---------------------------- | ---------------------------------------------------- |
| `removeButtonProps` | `Ref`                        | Remove button bindings                               |
| `previewProps`      | `Ref<{ as, src, alt, ... }>` | Preview element props (`as` is `'img'` or `'video'`) |
| `hasPreview`        | `boolean`                    | Whether file has a preview                           |

### useFileEntry Props

| Name           | Type      | Description              |
| -------------- | --------- | ------------------------ |
| `file`         | `File`    | File object              |
| `id`           | `string`  | Entry ID                 |
| `isUploading`  | `boolean` | Upload status            |
| `uploadResult` | `string`  | Upload result identifier |

### useFileEntry Returns

| Name                | Type                                                                  | Description            |
| ------------------- | --------------------------------------------------------------------- | ---------------------- |
| `isUploaded`        | `Ref<string>`                                                         | Upload status          |
| `name`              | `Ref<string>`                                                         | File name              |
| `previewProps`      | `Ref<{ as, src, alt, controls, muted, loop, autoplay, playsinline }>` | Preview bindings       |
| `remove`            | `() => void`                                                          | Remove entry           |
| `removeButtonProps` | `Ref`                                                                 | Remove button bindings |
