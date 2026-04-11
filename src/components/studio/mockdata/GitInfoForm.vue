<script setup lang="ts">
import type { GitInfo } from '@owloops/claude-powerline/browser'
import { DEFAULT_MOCK_DATA } from '@/data/mockPresets'

const store = useMockDataStore()

const enabled = computed({
	get: () => store.gitInfo !== null,
	set: (v: boolean) => {
		if (v) {
			const preset = store.getActivePresetData()
			const restored = preset.gitInfo ?? structuredClone(DEFAULT_MOCK_DATA.gitInfo)
			store.gitInfo = structuredClone(restored)
		} else {
			store.gitInfo = null
		}
		store.markCustom()
	},
})

function field<K extends keyof GitInfo>(key: K) {
	return computed({
		get: () => store.gitInfo?.[key] ?? undefined,
		set: (v: GitInfo[K] | undefined) => {
			if (!store.gitInfo) return
			store.gitInfo[key] = v as GitInfo[K]
			store.markCustom()
		},
	})
}

const branch = field('branch')
const status = field('status')
const ahead = field('ahead')
const behind = field('behind')
const staged = field('staged')
const unstaged = field('unstaged')
const untracked = field('untracked')
const conflicts = field('conflicts')
const operation = field('operation')
const tag = field('tag')
const sha = field('sha')
const timeSinceCommit = field('timeSinceCommit')
const stashCount = field('stashCount')
const upstream = field('upstream')
const repoName = field('repoName')
const isWorktree = field('isWorktree')

function numModel(f: ReturnType<typeof field>) {
	return computed({
		get: () => f.value ?? '',
		set: (v: string | number) => {
			const n = Number(v)
			f.value = v === '' || Number.isNaN(n) ? undefined : n
		},
	})
}

const aheadNum = numModel(ahead as ReturnType<typeof field>)
const behindNum = numModel(behind as ReturnType<typeof field>)
const stagedNum = numModel(staged as ReturnType<typeof field>)
const unstagedNum = numModel(unstaged as ReturnType<typeof field>)
const untrackedNum = numModel(untracked as ReturnType<typeof field>)
const conflictsNum = numModel(conflicts as ReturnType<typeof field>)
const timeSinceCommitNum = numModel(timeSinceCommit as ReturnType<typeof field>)
const stashCountNum = numModel(stashCount as ReturnType<typeof field>)
</script>

<template>
	<div class="flex flex-col gap-2">
		<template v-if="enabled">
			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Branch</Label>
				<Input
					:model-value="branch ?? ''"
					class="h-8 text-xs font-mono"
					@update:model-value="branch = $event as string"
				/>
			</div>

			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Status</Label>
				<Select
					:model-value="status as string"
					@update:model-value="status = $event as 'clean' | 'dirty' | 'conflicts'"
				>
					<SelectTrigger class="h-8 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="clean">clean</SelectItem>
						<SelectItem value="dirty">dirty</SelectItem>
						<SelectItem value="conflicts">conflicts</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Ahead</Label>
					<Input v-model="aheadNum" type="number" class="h-8 text-xs" min="0" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Behind</Label>
					<Input v-model="behindNum" type="number" class="h-8 text-xs" min="0" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Staged</Label>
					<Input v-model="stagedNum" type="number" class="h-8 text-xs" min="0" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Unstaged</Label>
					<Input v-model="unstagedNum" type="number" class="h-8 text-xs" min="0" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Untracked</Label>
					<Input v-model="untrackedNum" type="number" class="h-8 text-xs" min="0" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Conflicts</Label>
					<Input v-model="conflictsNum" type="number" class="h-8 text-xs" min="0" />
				</div>
			</div>

			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Operation</Label>
				<Input
					:model-value="operation ?? ''"
					class="h-8 text-xs"
					placeholder="MERGE, REBASE, CHERRY-PICK..."
					@update:model-value="operation = ($event as string) || undefined"
				/>
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Tag</Label>
					<Input
						:model-value="tag ?? ''"
						class="h-8 text-xs"
						@update:model-value="tag = ($event as string) || undefined"
					/>
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">SHA</Label>
					<Input
						:model-value="sha ?? ''"
						class="h-8 text-xs font-mono"
						@update:model-value="sha = ($event as string) || undefined"
					/>
				</div>
			</div>

			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground"
					>Time Since Commit <span class="text-muted-foreground/60">(seconds)</span></Label
				>
				<Input v-model="timeSinceCommitNum" type="number" class="h-8 text-xs" min="0" />
			</div>

			<div class="grid grid-cols-2 gap-2">
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground">Stash Count</Label>
					<Input v-model="stashCountNum" type="number" class="h-8 text-xs" min="0" />
				</div>
				<div class="space-y-1.5">
					<Label class="text-xs text-muted-foreground flex items-center gap-1"> Worktree </Label>
					<div class="flex h-8 items-center">
						<Switch
							:model-value="isWorktree ?? false"
							@update:model-value="isWorktree = $event || undefined"
						/>
					</div>
				</div>
			</div>

			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Upstream</Label>
				<Input
					:model-value="upstream ?? ''"
					class="h-8 text-xs font-mono"
					@update:model-value="upstream = ($event as string) || undefined"
				/>
			</div>

			<div class="space-y-1.5">
				<Label class="text-xs text-muted-foreground">Repo Name</Label>
				<Input
					:model-value="repoName ?? ''"
					class="h-8 text-xs"
					@update:model-value="repoName = ($event as string) || undefined"
				/>
			</div>
		</template>
	</div>
</template>
