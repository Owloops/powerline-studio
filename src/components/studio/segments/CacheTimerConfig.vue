<script setup lang="ts">
import FormSelectField from '@/components/FormSelectField.vue'
import FormNumberField from '@/components/FormNumberField.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import FormShowIconRow from './FormShowIconRow.vue'
import { cacheTimerConfigSchema } from './schemas'
import { CACHE_TIMER_DISPLAY_MODE_OPTIONS } from './options'
import { SEGMENT_DEFAULTS } from '@/stores/config'

const { values } = useSegmentForm('cacheTimer', cacheTimerConfigSchema, () => {
	const seg = useConfigStore().currentLineSegments.cacheTimer
	return {
		displayMode: seg?.displayMode ?? SEGMENT_DEFAULTS.cacheTimer.displayMode,
		ttlSeconds: seg?.ttlSeconds,
	}
})
</script>

<template>
	<div class="space-y-3">
		<FormShowIconRow segment-name="cacheTimer" />
		<FormSelectField
			name="displayMode"
			label="Display Mode"
			:options="CACHE_TIMER_DISPLAY_MODE_OPTIONS"
		/>
		<p class="text-sm text-muted-foreground">
			Time since the last user turn, anchored to Anthropic's prompt-cache TTL.
			<span class="font-mono">Elapsed</span> counts up (green 0–3m → warn 3–5m → critical 5m+).
			<span class="font-mono">Remaining</span> counts down to expiry (warn &lt;5m → critical &lt;1m
			→ <span class="font-mono">"cold"</span> at 0).
		</p>
		<FormNumberField
			v-if="values.displayMode === 'remaining'"
			name="ttlSeconds"
			label="TTL Override (seconds)"
			description="Leave empty to auto-detect from transcript usage data (typically 300 for 5-minute caches or 3600 for 1-hour). Set a value to pin the countdown to a fixed TTL."
			:min="1"
			:step="60"
		/>
		<Alert variant="info">
			<IconLucide-info />
			<AlertTitle>Set <span class="font-mono">refreshInterval: 10</span> in real usage</AlertTitle>
			<AlertDescription>
				Claude Code only re-runs the statusline on events, so the timer freezes between turns unless
				you set <span class="font-mono">refreshInterval: 10</span> (seconds, min 1) in the
				<span class="font-mono">statusLine</span> block of
				<span class="font-mono">~/.claude/settings.json</span>. See the
				<a
					href="https://github.com/Owloops/claude-powerline#cache-timer"
					target="_blank"
					rel="noopener noreferrer"
					class="underline hover:no-underline"
					>Cache Timer README</a
				>
				for the recommended config.
			</AlertDescription>
		</Alert>
	</div>
</template>
