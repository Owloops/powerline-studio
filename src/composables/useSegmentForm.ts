import { useForm } from '@formwerk/core'
import type { GenericFormSchema } from '@formwerk/core'
import type { StudioSegmentsMap } from '@/components/studio/segments/segmentMeta'

type SegmentKey = keyof StudioSegmentsMap

export function useSegmentForm<T extends Record<string, unknown>>(
	segmentKey: SegmentKey,
	schema: GenericFormSchema,
	initialValues: () => T,
) {
	const configStore = useConfigStore()
	const editorStore = useEditorStore()

	const segmentConfig = computed(initialValues)

	const { values } = useForm({
		schema,
		initialValues: segmentConfig.value,
	})

	watch(
		values,
		(newValues) => {
			configStore.updateSegmentConfig(editorStore.activeLineIndex, segmentKey, newValues)
		},
		{ deep: true },
	)

	return { values, segmentConfig }
}
