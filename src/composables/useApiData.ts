export interface ApiItem {
	id: number
	name: string
	status: 'active' | 'inactive'
	createdAt: string
}

const mockItems: ApiItem[] = [
	{ id: 1, name: 'Alpha Project', status: 'active', createdAt: '2026-01-15' },
	{ id: 2, name: 'Beta Service', status: 'active', createdAt: '2026-02-20' },
	{ id: 3, name: 'Gamma Module', status: 'inactive', createdAt: '2026-03-10' },
	{ id: 4, name: 'Delta Integration', status: 'active', createdAt: '2026-04-01' },
]

export function useApiData() {
	const items = ref<ApiItem[]>([])
	const isLoading = ref(false)
	const error = ref<string | null>(null)
	const isUsingMockData = ref(false)

	async function fetchItems() {
		isLoading.value = true
		error.value = null
		isUsingMockData.value = false

		try {
			const response = await fetch('/api/items')
			if (!response.ok) throw new Error(`HTTP ${response.status}`)
			items.value = await response.json()
		} catch {
			isUsingMockData.value = true
			items.value = mockItems
		} finally {
			isLoading.value = false
		}
	}

	return { items, isLoading, error, isUsingMockData, fetchItems }
}
