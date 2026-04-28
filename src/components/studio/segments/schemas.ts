import { z } from 'zod'
import {
	DIRECTORY_STYLES,
	USAGE_TYPES,
	COST_SOURCES,
	BAR_DISPLAY_STYLES,
	BLOCK_TYPES,
	BURN_TYPES,
	PERCENTAGE_MODES,
	BUDGET_TYPES,
} from './options'

export const directoryConfigSchema = z.object({
	style: z.enum(DIRECTORY_STYLES),
})

export const gitConfigSchema = z.object({
	showSha: z.boolean(),
	showAheadBehind: z.boolean(),
	showWorkingTree: z.boolean(),
	showOperation: z.boolean(),
	showTag: z.boolean(),
	showTimeSinceCommit: z.boolean(),
	showStashCount: z.boolean(),
	showUpstream: z.boolean(),
	showRepoName: z.boolean(),
})

export const sessionConfigSchema = z.object({
	type: z.enum(USAGE_TYPES),
	costSource: z.enum(COST_SOURCES),
})

export const contextConfigSchema = z.object({
	displayStyle: z.enum(BAR_DISPLAY_STYLES),
	showPercentageOnly: z.boolean(),
	percentageMode: z.enum(PERCENTAGE_MODES),
	autocompactBuffer: z.number().int().min(0),
})

export const blockConfigSchema = z.object({
	type: z.enum(BLOCK_TYPES),
	burnType: z.enum(BURN_TYPES),
	displayStyle: z.enum(BAR_DISPLAY_STYLES),
})

export const metricsConfigSchema = z.object({
	showResponseTime: z.boolean(),
	showLastResponseTime: z.boolean(),
	showDuration: z.boolean(),
	showMessageCount: z.boolean(),
	showLinesAdded: z.boolean(),
	showLinesRemoved: z.boolean(),
})

export const todayConfigSchema = z.object({
	type: z.enum(USAGE_TYPES),
})

export const envConfigSchema = z.object({
	variable: z.string().min(1, 'Environment variable name is required'),
	prefix: z.string().optional(),
})

export const weeklyConfigSchema = z.object({
	displayStyle: z.enum(BAR_DISPLAY_STYLES),
})

export const sessionIdConfigSchema = z.object({
	showIdLabel: z.boolean(),
})

export const budgetItemSchema = z.object({
	amount: z.number().min(0),
	warningThreshold: z.number().int().min(0).max(100),
	type: z.enum(BUDGET_TYPES),
})

export const agentConfigSchema = z.object({
	showLabel: z.boolean(),
})
