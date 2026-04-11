# Notification

Toast notification system with four types, auto-dismiss with hover-to-pause, duplicate prevention via reference IDs, and bottom-right positioning.

## Installation

```bash
pnpm dlx shadcn-vue@latest add @electricity-ui/notification
```

## Props (Component)

```typescript
interface Props {
	type: 'success' | 'info' | 'warning' | 'danger'
	animated?: boolean
	title?: string
	message: string
	id: string
	dismissNotification: (id: string) => void
}
```

## Notification Types

| Type    | Color               | Use Case                             |
| ------- | ------------------- | ------------------------------------ |
| success | Green (green-500)   | Successful operations, confirmations |
| info    | Blue (blue-500)     | Informational, status updates        |
| warning | Yellow (yellow-500) | Cautionary messages                  |
| danger  | Red (red-500)       | Errors, critical issues              |

## Legacy UMD: Global Utility

```javascript
EUI.Utils.createNotification(type, title, message, (timeout = 0), (id = null))
```

- `type`: `'success' | 'info' | 'warning' | 'danger'`
- `title`: Title text (can be empty string)
- `message`: Main notification message
- `timeout`: Auto-dismiss in **seconds** (0 = never auto-dismiss)
- `id`: Optional reference ID for duplicate prevention

### Examples

```javascript
EUI.Utils.createNotification('success', 'Hello World!', 'This is a notification', 3, 'yo1')
EUI.Utils.createNotification('warning', 'Warning!', 'Something needs attention', 4, 'yo2')
EUI.Utils.createNotification('danger', 'Error', 'Operation failed', 4, 'yo3')
EUI.Utils.createNotification('info', 'Info', 'New update available', 4, 'yo4')
EUI.Utils.createNotification('success', 'Saved', 'Never auto-dismissed', 0, 'yo5')
```

## Global System (Legacy)

- Included in every page via `@RenderPage("~/Shared/Components/_Notification.cshtml")` in `_Head.cshtml`
- Mounts a separate Vue app on `#notification-app`
- Positioned bottom-right: `fixed bottom-4 sm:bottom-8 right-4 sm:right-6 z-50`
- Width: `clamp(20rem, 28rem, 36rem)`

## Features

### Auto-Dismiss Timer

- Configurable timeout in seconds (0 = infinite)
- **Hover to pause**: Timer suspends on mouse enter
- **Resume on leave**: Timer continues on mouse leave

### Duplicate Prevention

- Same `id` reference --> existing notification gets "bumped" (pulse animation)
- Timer resets for bumped notifications
- No duplicate created

### Animations

**Enter**: Slide up + fade in (300ms)

```css
enter-from: translate-y-16 opacity-0
enter-to: translate-y-0 opacity-100
```

**Leave**: Slide right + fade out (200ms)

```css
leave-from: opacity-100 translate-x-0
leave-to: opacity-0 translate-x-16
```

**Bump (duplicate prevention)**: Pulse animation (500ms)

## Alert vs Notification

| Alert                        | Notification                     |
| ---------------------------- | -------------------------------- |
| Inline in page content       | Fixed positioned (bottom-right)  |
| Persistent until dismissed   | Timer-based auto-dismiss         |
| Colored backgrounds          | White background + colored icons |
| Single component             | Multiple stack with `space-y-5`  |
| Form validation, page status | CRUD feedback, global status     |

## Best Practices

- Use 3-5 second timeout for most notifications
- Use `timeout: 0` for critical messages requiring acknowledgment
- Use reference IDs to prevent spam from repeated operations
- Match type to context: `success` for positive feedback, `danger` for errors, `info` for neutral updates
- Keep messages concise and quickly readable
