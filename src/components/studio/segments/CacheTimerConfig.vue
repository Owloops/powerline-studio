<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
</script>

<template>
	<div class="space-y-3">
		<p class="text-sm text-muted-foreground">
			Shows time since the last user turn, anchored to Anthropic's 5-minute prompt-cache TTL. Color
			tiers: green (0–3m) → context warning (3–5m) → context critical (5m+). Format:
			<span class="font-mono">m:ss</span> &lt; 5m, <span class="font-mono">Xm</span> up to 1h,
			<span class="font-mono">1h+</span> after.
		</p>
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
