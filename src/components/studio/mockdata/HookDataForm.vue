<script setup lang="ts">
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'

const store = useMockDataStore()

const UNSET = '__unset__'

const EFFORT_OPTIONS = [
	{ label: 'Unset', value: UNSET },
	{ label: 'low', value: 'low' },
	{ label: 'medium', value: 'medium' },
	{ label: 'high', value: 'high' },
	{ label: 'xhigh', value: 'xhigh' },
] as const

const THINKING_OPTIONS = [
	{ label: 'Unset', value: UNSET },
	{ label: 'On', value: 'on' },
	{ label: 'Off', value: 'off' },
] as const

const modelDisplayName = computed({
	get: () => store.hookData.model.display_name,
	set: (v: string) => {
		store.updateHookData({ model: { ...store.hookData.model, display_name: v } })
	},
})

const modelId = computed({
	get: () => store.hookData.model.id,
	set: (v: string) => {
		store.updateHookData({ model: { ...store.hookData.model, id: v } })
	},
})

const cwd = computed({
	get: () => store.hookData.cwd,
	set: (v: string) => {
		store.updateHookData({ cwd: v })
	},
})

const version = computed({
	get: () => store.hookData.version ?? '',
	set: (v: string) => {
		// Direct assignment because deepMerge skips undefined values
		store.hookData.version = v || undefined
		store.markCustom()
	},
})

const sessionId = computed({
	get: () => store.hookData.session_id,
	set: (v: string) => {
		store.updateHookData({ session_id: v })
	},
})

const tmuxId = computed({
	get: () => store.tmuxSessionId ?? '',
	set: (v: string) => {
		store.setTmuxSessionId(v || null)
	},
})

const agentName = computed({
	get: () => store.hookData.agent?.name ?? '',
	set: (v: string) => {
		// Direct assignment because deepMerge skips undefined values, so we can
		// clear the field by setting `agent` itself to undefined.
		store.hookData.agent = v ? { name: v } : undefined
		store.markCustom()
	},
})

const effortLevel = computed({
	get: () => store.hookData.effort?.level ?? UNSET,
	set: (v: string) => {
		// Direct assignment: clear by setting parent `effort` to undefined.
		store.hookData.effort = v && v !== UNSET ? { level: v } : undefined
		store.markCustom()
	},
})

const thinkingState = computed({
	get: (): string => {
		const enabled = store.hookData.thinking?.enabled
		if (enabled === true) return 'on'
		if (enabled === false) return 'off'
		return UNSET
	},
	set: (v: string) => {
		if (v === 'on') {
			store.hookData.thinking = { enabled: true }
		} else if (v === 'off') {
			store.hookData.thinking = { enabled: false }
		} else {
			store.hookData.thinking = undefined
		}
		store.markCustom()
	},
})
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Model Display Name</Label>
				<Input v-model="modelDisplayName" class="h-8 text-xs" />
			</div>
			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Model ID</Label>
				<Input v-model="modelId" class="h-8 text-xs" />
			</div>
		</div>
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">Working Directory</Label>
			<Input v-model="cwd" class="h-8 text-xs font-mono" />
		</div>
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Version</Label>
				<Input v-model="version" class="h-8 text-xs" />
			</div>
			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Session ID</Label>
				<Input v-model="sessionId" class="h-8 text-xs font-mono" />
			</div>
		</div>
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">Tmux Session ID</Label>
			<Input v-model="tmuxId" class="h-8 text-xs font-mono" placeholder="null (empty = null)" />
		</div>
		<div class="space-y-1.5">
			<Label class="text-xs text-muted-foreground">Agent Name</Label>
			<Input v-model="agentName" class="h-8 text-xs" placeholder="researcher (empty = no agent)" />
		</div>
		<div class="grid grid-cols-2 gap-2">
			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Thinking Enabled</Label>
				<Select v-model="thinkingState">
					<SelectTrigger class="h-8 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem
							v-for="opt in THINKING_OPTIONS"
							:key="opt.value"
							:value="opt.value"
							class="text-xs"
						>
							{{ opt.label }}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Effort Level</Label>
				<Select v-model="effortLevel">
					<SelectTrigger class="h-8 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem
							v-for="opt in EFFORT_OPTIONS"
							:key="opt.value"
							:value="opt.value"
							class="text-xs"
						>
							{{ opt.label }}
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	</div>
</template>
