<script setup lang="ts">
import type { StudioPanel, SidebarNavItem } from '@/types/studio'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	useSidebar,
} from '@/components/ui/sidebar'
import IconPalette from '~icons/lucide/palette'
import IconLayoutList from '~icons/lucide/layout-list'
import IconGrid3x3 from '~icons/lucide/grid-3x3'
import IconDatabase from '~icons/lucide/database'
import IconArrowLeftRight from '~icons/lucide/arrow-left-right'

const activePanel = defineModel<StudioPanel>('activePanel', { required: true })

const { isMobile, setOpenMobile } = useSidebar()
const configStore = useConfigStore()

const allNavItems: SidebarNavItem[] = [
	{ id: 'appearance', label: 'Appearance', icon: IconPalette },
	{ id: 'segments', label: 'Segments', icon: IconLayoutList },
	{ id: 'tui', label: 'TUI Layout', icon: IconGrid3x3 },
	{ id: 'mockData', label: 'Mock Data', icon: IconDatabase },
	{ id: 'export', label: 'Export & Import', icon: IconArrowLeftRight },
]

const navItems = computed(() =>
	allNavItems.filter((item) => {
		// Hide Segments panel when TUI style is active (TUI layout defines segment placement)
		if (item.id === 'segments' && configStore.isTuiStyle) return false
		// Hide TUI Layout panel when not in TUI style
		if (item.id === 'tui' && !configStore.isTuiStyle) return false
		return true
	}),
)

function selectPanel(id: StudioPanel) {
	activePanel.value = id
	if (isMobile.value) {
		setOpenMobile(false)
	}
}
</script>

<template>
	<Sidebar collapsible="icon">
		<SidebarContent>
			<SidebarGroup>
				<SidebarGroupLabel>Configuration</SidebarGroupLabel>
				<SidebarMenu>
					<SidebarMenuItem v-for="item in navItems" :key="item.id">
						<SidebarMenuButton
							:is-active="activePanel === item.id"
							:tooltip="item.label"
							@click="selectPanel(item.id)"
						>
							<component :is="item.icon" />
							<span>{{ item.label }}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroup>
		</SidebarContent>
		<SidebarRail />
	</Sidebar>
</template>
