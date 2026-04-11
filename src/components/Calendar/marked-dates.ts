import { computed, type ComputedRef, type InjectionKey } from 'vue'

export interface CalendarMarkedDate {
	date: Date | string
	class?: string
	reason?: string
}

export type MarkedDates = (Date | string | CalendarMarkedDate)[]

export const MARKED_DATES_KEY = Symbol() as InjectionKey<
	ComputedRef<Map<string, CalendarMarkedDate>>
>

function normalizeMarkedDate(entry: Date | string | CalendarMarkedDate): CalendarMarkedDate | null {
	if (entry == null) return null
	if (entry instanceof Date || typeof entry === 'string') {
		return { date: entry }
	}
	if (typeof entry === 'object' && 'date' in entry) {
		return entry
	}
	return null
}

export function toDateKey(date: Date | string): string | null {
	if (date instanceof Date) {
		if (isNaN(date.getTime())) return null
		const y = date.getFullYear()
		const m = String(date.getMonth() + 1).padStart(2, '0')
		const d = String(date.getDate()).padStart(2, '0')
		return `${y}-${m}-${d}`
	}
	if (typeof date === 'string') {
		const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
		if (!match) return null
		return `${match[1]}-${match[2]}-${match[3]}`
	}
	return null
}

export function dateValueToKey(year: number, month: number, day: number): string {
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function useMarkedDatesMap(markedDates: () => MarkedDates | undefined) {
	return computed(() => {
		const map = new Map<string, CalendarMarkedDate>()
		for (const entry of markedDates() ?? []) {
			const mark = normalizeMarkedDate(entry)
			if (!mark) continue
			const key = toDateKey(mark.date)
			if (key && !map.has(key)) map.set(key, mark)
		}
		return map
	})
}
