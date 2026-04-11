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
