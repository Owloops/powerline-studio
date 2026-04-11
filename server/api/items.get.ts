import { defineHandler } from 'nitro'

export default defineHandler(() => {
	return [
		{ id: 1, name: 'Alpha Project', status: 'active', createdAt: '2026-01-15' },
		{ id: 2, name: 'Beta Service', status: 'active', createdAt: '2026-02-20' },
		{ id: 3, name: 'Gamma Module', status: 'inactive', createdAt: '2026-03-10' },
		{ id: 4, name: 'Delta Integration', status: 'active', createdAt: '2026-04-01' },
		{ id: 5, name: 'Epsilon Pipeline', status: 'active', createdAt: '2026-04-09' },
	]
})
