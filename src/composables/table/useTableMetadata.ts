import { reactive, computed, ref, watch } from 'vue'
import type { Ref } from 'vue'

export type MetadataUpdateFn = (
	event: 'update:metadata',
	value: Record<string, Record<string, any>>,
) => void

export function useTableMetadata(
	externalMetadata?: Ref<Record<string, Record<string, any>> | null | undefined>,
	emitUpdate?: MetadataUpdateFn,
) {
	// Internal metadata state - only used if no external metadata is provided
	const internalMetadata = reactive<Record<string, Record<string, any>>>({})

	// Determine if we're using external metadata
	const usingExternalMetadata = computed(
		() => externalMetadata?.value !== null && externalMetadata?.value !== undefined,
	)

	// Reference to the active metadata source (either external or internal)
	const activeMetadata = computed(() =>
		usingExternalMetadata.value ? externalMetadata!.value! : internalMetadata,
	)

	// All metadata for public access and exposure
	const allMetadata = ref<Record<string, Record<string, any>>>({})

	// Update the allMetadata ref whenever the active metadata changes
	watch(
		() => activeMetadata.value,
		(newMetadata) => {
			// Create a completely new object to ensure Vue detects changes
			allMetadata.value = Object.fromEntries(
				Object.entries(newMetadata).map(([key, value]) => [key, { ...value }]),
			)
		},
		{ deep: true, immediate: true },
	)

	// Get metadata for a specific row
	const getRowMetadata = (rowId: string): Record<string, any> => {
		if (!rowId) {
			return {}
		}

		// Get from the active source
		const metadata = activeMetadata.value

		// Create if doesn't exist
		if (!metadata[rowId]) {
			if (usingExternalMetadata.value && emitUpdate) {
				// For external metadata, we need to create a new object and emit the update
				const updatedMetadata = {
					...metadata,
					[rowId]: {},
				}
				emitUpdate('update:metadata', updatedMetadata)
				// Return empty object for now - it will be updated when the prop changes
				return {}
			} else {
				// For internal metadata, we can mutate directly
				internalMetadata[rowId] = {}
			}
		}

		return metadata[rowId] || {}
	}

	// Set metadata for a specific row and key
	const setRowMetadata = (rowId: string, key: string, value: any): any => {
		if (!rowId) {
			return value
		}

		if (usingExternalMetadata.value && emitUpdate) {
			// For external metadata, we need to create a new object to ensure reactivity
			const currentMetadata = { ...activeMetadata.value }
			const rowMetadata = currentMetadata[rowId] || {}

			const updatedRowMetadata = { ...rowMetadata, [key]: value }
			currentMetadata[rowId] = updatedRowMetadata

			emitUpdate('update:metadata', currentMetadata)
		} else {
			// For internal metadata, we can mutate directly
			const metadata = getRowMetadata(rowId)
			metadata[key] = value

			// Update the ref directly for immediate reactivity
			if (!allMetadata.value[rowId]) {
				allMetadata.value[rowId] = {}
			}
			allMetadata.value[rowId][key] = value
		}

		return value
	}

	// Clear metadata for a row
	const clearRowMetadata = (rowId: string): void => {
		if (usingExternalMetadata.value && emitUpdate) {
			// For external metadata, create a new object without this row
			const currentMetadata = { ...activeMetadata.value }

			if (currentMetadata[rowId]) {
				delete currentMetadata[rowId]
				emitUpdate('update:metadata', currentMetadata)
			}
		} else if (internalMetadata[rowId]) {
			// For internal metadata, delete directly
			delete internalMetadata[rowId]

			// Update the ref
			if (allMetadata.value[rowId]) {
				delete allMetadata.value[rowId]
				allMetadata.value = { ...allMetadata.value }
			}
		}
	}

	// Clear all metadata
	const clearAllMetadata = (): void => {
		if (usingExternalMetadata.value && emitUpdate) {
			// For external metadata, emit an empty object
			emitUpdate('update:metadata', {})
		} else {
			// For internal metadata, clear directly
			Object.keys(internalMetadata).forEach((key) => {
				delete internalMetadata[key]
			})

			// Reset the ref
			allMetadata.value = {}
		}
	}

	return {
		getRowMetadata,
		setRowMetadata,
		clearRowMetadata,
		clearAllMetadata,
		allMetadata,
	}
}

// Type for the metadata context
export type TableMetadataContext = ReturnType<typeof useTableMetadata>
