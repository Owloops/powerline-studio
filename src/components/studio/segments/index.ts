import type { Component } from 'vue'
import DirectoryConfig from './DirectoryConfig.vue'
import GitConfig from './GitConfig.vue'
import ModelConfig from './ModelConfig.vue'
import SessionConfig from './SessionConfig.vue'
import ContextConfig from './ContextConfig.vue'
import BlockConfig from './BlockConfig.vue'
import MetricsConfig from './MetricsConfig.vue'
import TodayConfig from './TodayConfig.vue'
import EnvConfig from './EnvConfig.vue'
import WeeklyConfig from './WeeklyConfig.vue'
import VersionConfig from './VersionConfig.vue'
import TmuxConfig from './TmuxConfig.vue'
import SessionIdConfig from './SessionIdConfig.vue'

export const segmentConfigMap: Record<string, Component> = {
	directory: DirectoryConfig,
	git: GitConfig,
	model: ModelConfig,
	session: SessionConfig,
	context: ContextConfig,
	block: BlockConfig,
	metrics: MetricsConfig,
	today: TodayConfig,
	env: EnvConfig,
	weekly: WeeklyConfig,
	version: VersionConfig,
	tmux: TmuxConfig,
	sessionId: SessionIdConfig,
}
