/**
 * Key-order-independent deep equality for plain JSON-safe objects.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true
	if (a == null || b == null) return a === b
	if (typeof a !== typeof b) return false
	if (typeof a !== 'object') return false

	const aIsArr = Array.isArray(a)
	const bIsArr = Array.isArray(b)
	if (aIsArr !== bIsArr) return false

	if (aIsArr) {
		const aA = a as unknown[]
		const bA = b as unknown[]
		if (aA.length !== bA.length) return false
		return aA.every((v, i) => deepEqual(v, bA[i]))
	}

	const aObj = a as Record<string, unknown>
	const bObj = b as Record<string, unknown>
	const aKeys = Object.keys(aObj)
	const bKeys = Object.keys(bObj)
	if (aKeys.length !== bKeys.length) return false
	return aKeys.every((key) => key in bObj && deepEqual(aObj[key], bObj[key]))
}

/**
 * Deep merge utility for store mutations.
 * Matches upstream claude-powerline behavior:
 * - Recursively merges plain objects
 * - Replaces arrays wholesale (not element-by-element)
 * - Handles null correctly (typeof null === 'object')
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
	const result = { ...target }

	for (const key in source) {
		const sourceValue = source[key]
		if (sourceValue !== undefined) {
			if (typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue)) {
				const targetValue = result[key] || {}
				result[key] = deepMerge(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					targetValue as Record<string, any>,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					sourceValue as Record<string, any>,
				) as T[Extract<keyof T, string>]
			} else {
				result[key] = sourceValue as T[Extract<keyof T, string>]
			}
		}
	}

	return result
}
