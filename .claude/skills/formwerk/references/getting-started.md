# Getting Started

## What is Formwerk?

Formwerk is a library of headless composables for Vue.js that helps you build accessible, high-quality form components for your applications or design systems.

The library provides tree-shakable composables handling accessibility, interaction, validation, and behavioral best practices. Its goal is to offer an uncompromising new baseline of accessibility, interaction, and quality for building forms in Vue.

## Installation

```bash
npm install @formwerk/core
```

```bash
pnpm add @formwerk/core
```

```bash
bun add @formwerk/core
```

```bash
yarn add @formwerk/core
```

## Basic Usage

### Step 1: Import a composable and build your component

```vue
<script setup lang="ts">
import { type TextFieldProps, useTextField } from '@formwerk/core'

const props = defineProps<TextFieldProps>()
const { inputProps, labelProps, errorMessage, errorMessageProps } = useTextField(props)
</script>

<template>
	<div>
		<label v-bind="labelProps">{{ label }}</label>
		<input v-bind="inputProps" />
		<div v-if="errorMessage" v-bind="errorMessageProps">
			{{ errorMessage }}
		</div>
	</div>
</template>
```

### Step 2: Use your component

```vue
<script setup>
import { TextField } from './TextField.vue'
const email = ref('')
</script>

<template>
	<TextField label="Email" type="email" v-model="email" />
</template>
```

## Key Pattern

1. Import a composable (e.g. `useTextField`) and its corresponding props type (e.g. `TextFieldProps`) from `@formwerk/core`
2. Pass component props through to the composable
3. Destructure returned binding objects (`inputProps`, `labelProps`, `errorMessageProps`, etc.) and spread them onto your template elements with `v-bind`
4. The composable handles accessibility attributes, validation, interaction behavior, and value tracking automatically

## Next Steps

- Explore the composables guide for the full list of available composables
- Check starter kits for initial project setup
