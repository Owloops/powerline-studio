import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
	GridComponent,
	TooltipComponent,
	LegendComponent,
	DataZoomComponent,
	ToolboxComponent,
} from 'echarts/components'

use([
	CanvasRenderer,
	LineChart,
	BarChart,
	GridComponent,
	TooltipComponent,
	LegendComponent,
	DataZoomComponent,
	ToolboxComponent,
])

export { default as VChart } from 'vue-echarts'
export { default } from 'vue-echarts'
