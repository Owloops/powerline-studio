import type { Component } from 'vue'

export type StudioPanel = 'appearance' | 'segments' | 'tui' | 'mockData' | 'export'

export interface SidebarNavItem {
	id: StudioPanel
	label: string
	icon: Component
}
