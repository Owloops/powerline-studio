---
name: zod
description: Zod TypeScript-first schema validation — z.object, z.string, parse, safeParse, z.infer, transforms, refinements, Standard Schema, FormWerk integration
---

# Zod

TypeScript-first schema validation library. Define schemas, validate data, and infer static types. Implements the Standard Schema spec for integration with FormWerk, TanStack Form, and other tools.

## Installation

```bash
pnpm add zod
```

## Import

```ts
import { z } from 'zod'
// or
import * as z from 'zod'
```

## Defining Schemas

### Primitives

```ts
z.string()
z.number()
z.bigint()
z.boolean()
z.date()
z.symbol()
z.undefined()
z.null()
z.void() // equivalent to z.undefined()
z.any()
z.unknown()
z.never()
```

### Coercion

```ts
z.coerce.string() // String(input)
z.coerce.number() // Number(input)
z.coerce.boolean() // Boolean(input)
z.coerce.bigint() // BigInt(input)
z.coerce.date() // new Date(input)
```

### Literals

```ts
z.literal('hello')
z.literal(42)
z.literal(true)
```

### Strings with Validations

```ts
z.string().min(1) // non-empty
z.string().max(255)
z.string().length(5)
z.string().email()
z.string().url()
z.string().uuid()
z.string().cuid()
z.string().regex(/^[a-z]+$/)
z.string().startsWith('https://')
z.string().endsWith('.com')
z.string().trim() // trims whitespace (transform)
z.string().toLowerCase() // transforms to lowercase
z.string().toUpperCase()
z.string().datetime() // ISO 8601 datetime
z.string().ip() // IPv4 or IPv6
```

### Numbers with Validations

```ts
z.number().int()
z.number().positive()
z.number().nonnegative()
z.number().negative()
z.number().min(5)
z.number().max(100)
z.number().multipleOf(5)
z.number().finite()
z.number().safe() // Number.MIN_SAFE_INTEGER to MAX
```

### Objects

```ts
const User = z.object({
	name: z.string(),
	age: z.number().int().positive(),
	email: z.string().email(),
})

// All fields optional
User.partial()

// Specific fields optional
User.partial({ age: true })

// Make optional fields required
User.required()

// Pick/Omit fields
User.pick({ name: true, email: true })
User.omit({ age: true })

// Extend
User.extend({ role: z.enum(['admin', 'user']) })

// Merge two schemas
const Extended = User.merge(z.object({ role: z.string() }))

// Access shape
User.shape.name // z.string()

// Strict (reject unknown keys)
z.object({ name: z.string() }).strict()

// Passthrough (allow unknown keys)
z.object({ name: z.string() }).passthrough()

// Strip unknown keys (default behavior)
z.object({ name: z.string() }).strip()
```

### Arrays

```ts
z.array(z.string())
z.array(z.number()).min(1).max(10)
z.array(z.string()).nonempty() // at least 1 element

// Shorthand
z.string().array() // same as z.array(z.string())
```

### Tuples

```ts
z.tuple([z.string(), z.number()])
z.tuple([z.string(), z.number()]).rest(z.boolean())
```

### Enums

```ts
z.enum(['admin', 'user', 'guest'])

// Native enum
enum Role {
	Admin = 'admin',
	User = 'user',
}
z.nativeEnum(Role)
```

### Unions & Discriminated Unions

```ts
z.union([z.string(), z.number()])

// Shorthand
z.string().or(z.number())

// Discriminated union (more efficient)
z.discriminatedUnion('type', [
	z.object({ type: z.literal('email'), email: z.string() }),
	z.object({ type: z.literal('phone'), phone: z.string() }),
])
```

### Other Types

```ts
z.record(z.string()) // { [k: string]: string }
z.record(z.string(), z.number()) // { [k: string]: number }
z.map(z.string(), z.number())
z.set(z.string())
z.promise(z.string())
z.instanceof(Date)

// Optional & Nullable
z.string().optional() // string | undefined
z.string().nullable() // string | null
z.string().nullish() // string | null | undefined

// Default values
z.string().default('hello')
z.number().default(42)
```

## Parsing & Validation

### parse (throws on failure)

```ts
const User = z.object({ name: z.string(), age: z.number() })

const user = User.parse({ name: 'Alice', age: 30 })
// => { name: 'Alice', age: 30 }

User.parse({ name: 42 })
// throws ZodError
```

### safeParse (returns result object)

```ts
const result = User.safeParse({ name: 'Alice', age: 30 })

if (result.success) {
	result.data // { name: string; age: number }
} else {
	result.error // ZodError with .issues array
}
```

### Async (for async refinements/transforms)

```ts
await schema.parseAsync(data)
await schema.safeParseAsync(data)
```

## Type Inference

```ts
const User = z.object({
	name: z.string(),
	age: z.number(),
})

// Extract TypeScript type from schema
type User = z.infer<typeof User>
// => { name: string; age: number }

// Input vs Output types (differ when using transforms)
type UserInput = z.input<typeof User>
type UserOutput = z.output<typeof User>
```

## Transforms

Transform data during parsing:

```ts
const schema = z.string().transform((val) => val.length)
// Input: string, Output: number

schema.parse('hello') // => 5

// Chain transforms
const trimmedEmail = z.string().trim().toLowerCase().email()
```

## Refinements

Custom validation logic:

```ts
const password = z
	.string()
	.refine((val) => val.length >= 8, { message: 'Password must be at least 8 characters' })

// superRefine for multiple issues
const form = z
	.object({
		password: z.string(),
		confirm: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirm) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Passwords must match',
				path: ['confirm'],
			})
		}
	})
```

## Integration with FormWerk (Standard Schema)

Zod implements the Standard Schema spec. Pass schemas directly to FormWerk:

### Per-Field Validation

```vue
<script setup lang="ts">
import { z } from 'zod'

const emailSchema = z.string().email('Invalid email address')
</script>

<template>
	<TextField name="email" label="Email" :schema="emailSchema" />
</template>
```

### Form-Level Validation

```ts
import { useForm } from '@formwerk/core'
import { z } from 'zod'

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(8, 'At least 8 characters'),
	age: z.number().int().min(18, 'Must be 18+'),
})

const { handleSubmit, values } = useForm({ schema })
// values is automatically typed from the schema
```

## Error Handling

```ts
try {
	schema.parse(data)
} catch (e) {
	if (e instanceof z.ZodError) {
		e.issues // Array of validation issues
		e.format() // Nested error object
		e.flatten() // { formErrors: string[], fieldErrors: Record<string, string[]> }
	}
}
```

### Issue Shape

```ts
{
  code: 'invalid_type',
  expected: 'string',
  received: 'number',
  path: ['user', 'name'],
  message: 'Expected string, received number',
}
```

## Common Patterns

### Custom Error Messages

```ts
z.string({ required_error: 'Name is required' }).min(1, 'Cannot be empty').max(100, 'Too long')
```

### Preprocessing

```ts
z.preprocess((val) => (typeof val === 'string' ? Number.parseInt(val, 10) : val), z.number())
```

### Recursive Types

```ts
interface Category {
	name: string
	children: Category[]
}

const Category: z.ZodType<Category> = z.lazy(() =>
	z.object({
		name: z.string(),
		children: z.array(Category),
	}),
)
```

## Gotchas

- `z.object()` **strips** unknown keys by default — use `.passthrough()` or `.strict()` to change
- `.parse()` returns a **deep clone** of the input, not the original object
- Transforms change the output type — `z.infer` returns the output type, use `z.input` for input
- Async refinements/transforms require `.parseAsync()` / `.safeParseAsync()`
- Zod schemas are immutable — methods return new schema instances
- For FormWerk integration, Zod works out of the box via Standard Schema — no adapter needed
- Zod v4 exists but v3 is still the widely-used stable version
