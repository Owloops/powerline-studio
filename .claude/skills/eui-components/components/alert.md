# Alert

Inline alert component for feedback, validation messages, and page-level status. Four types with dismissable support and animation.

## Installation

```bash
pnpm dlx shadcn-vue@latest add @electricity-ui/alert
```

## Props

```typescript
interface Props {
	type: 'success' | 'danger' | 'warning' | 'info'
	dismissable?: boolean // default: true
}
```

## Alert Types

| Type    | Background                       | Text              | Icon                                      |
| ------- | -------------------------------- | ----------------- | ----------------------------------------- |
| success | `bg-green-50 border-green-100`   | `text-green-800`  | `i-heroicons:check-circle-20-solid`       |
| danger  | `bg-red-50 border-red-100`       | `text-red-800`    | `i-heroicons:x-circle-20-solid`           |
| warning | `bg-yellow-50 border-yellow-100` | `text-yellow-800` | `i-heroicons:exclamation-circle-20-solid` |
| info    | `bg-blue-50 border-blue-100`     | `text-blue-800`   | `i-heroicons:information-circle-20-solid` |

## Usage

```html
<!-- Basic -->
<Alert type="success"> Your changes have been saved successfully! </Alert>

<!-- Non-dismissable -->
<Alert type="danger" :dismissable="false"> Critical error: Unable to connect to server </Alert>

<!-- Dynamic list -->
<div v-if="alerts.length > 0" class="max-w-4xl space-y-4 mb-6">
	<Alert
		v-for="alert in alerts"
		:key="alert.id"
		:type="alert.type"
		:dismissable="alert.dismissable"
	>
		{{ alert.message }}
	</Alert>
</div>
```

### Legacy UMD Registration

```javascript
app.component('electricity-alert', EUI.Components.Alert)
```

## Animation

```css
.alert-transition-leave-active,
.alert-transition-enter-active {
	transition: all 0.2s ease;
}
.alert-transition-enter-from,
.alert-transition-leave-to {
	transform: translateY(-20px);
	opacity: 0;
}
```

## Alert vs Notification

**Use Alert for**: Inline feedback, validation messages, page-level status, persistent context-specific messages

**Use Notification for**: System-wide messages, toast-style temporary updates, success confirmations for actions

## Common Patterns

```html
<!-- Validation errors -->
<Alert v-if="validationErrors.length" type="danger">
	<ul class="list-disc list-inside">
		<li v-for="error in validationErrors">{{ error }}</li>
	</ul>
</Alert>

<!-- Success after save -->
<Alert v-if="saveSuccess" type="success"> Form saved successfully at {{ saveTime }} </Alert>

<!-- Loading info -->
<Alert v-if="isLoading" type="info" :dismissable="false"> Loading data, please wait... </Alert>
```
