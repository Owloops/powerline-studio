<script setup lang="ts">
import { toast } from 'vue-sonner'
import {
	TableBody as UiTableBody,
	TableHeader as UiTableHeader,
	TableRow as UiTableRow,
} from '@/components/ui/table'

useHead({ title: 'Components' })
useSeoMeta({
	title: 'Components — Vue Template',
	description: 'Showcase of shadcn-vue components, Lucide icons, and Tailwind CSS 4 utilities',
})

const dialogOpen = ref(false)
const sheetOpen = ref(false)
const drawerOpen = ref(false)
const inputValue = ref('')

const selectValue = ref('')
const comboboxValue = ref<{ value: string; label: string } | null>(null)
const comboboxSearch = ref('')
const sliderValue = ref([50])
const rangeSliderValue = ref([25, 75])
const switchChecked = ref(false)
const radioValue = ref('comfortable')
const termsChecked = ref<boolean | 'indeterminate'>(false)
const marketingChecked = ref<boolean | 'indeterminate'>(false)
const toggleGroupValue = ref('center')
const stepperValue = ref(1)

const frameworks = [
	{ value: 'vue', label: 'Vue' },
	{ value: 'react', label: 'React' },
	{ value: 'angular', label: 'Angular' },
	{ value: 'svelte', label: 'Svelte' },
	{ value: 'solid', label: 'Solid' },
	{ value: 'qwik', label: 'Qwik' },
]

function comboboxFilter(list: typeof frameworks, term: string) {
	return list.filter((item) => item.label.toLowerCase().includes(term.toLowerCase()))
}

const invoices = [
	{ invoice: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
	{ invoice: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
	{ invoice: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
	{ invoice: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
	{ invoice: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
]

function showToast() {
	toast.success('Action completed', {
		description: 'This is a Sonner toast notification.',
	})
}

const colorSwatches = [
	{ name: 'background', var: 'bg-background', text: 'text-foreground' },
	{ name: 'primary', var: 'bg-primary', text: 'text-primary-foreground' },
	{ name: 'secondary', var: 'bg-secondary', text: 'text-secondary-foreground' },
	{ name: 'muted', var: 'bg-muted', text: 'text-muted-foreground' },
	{ name: 'accent', var: 'bg-accent', text: 'text-accent-foreground' },
	{ name: 'destructive', var: 'bg-destructive', text: 'text-white' },
	{ name: 'card', var: 'bg-card', text: 'text-card-foreground' },
	{ name: 'popover', var: 'bg-popover', text: 'text-popover-foreground' },
]
</script>

<template>
	<div class="flex flex-col gap-12">
		<section>
			<h1 class="text-3xl font-bold tracking-tight">Components</h1>
			<p class="mt-2 text-muted-foreground">
				shadcn-vue components, Lucide icons, and Tailwind CSS 4 utilities.
			</p>
		</section>

		<Separator />

		<!-- Buttons -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Buttons</h2>
			<div class="flex flex-wrap items-center gap-3">
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="link">Link</Button>
				<Button variant="destructive">Destructive</Button>
			</div>
			<div class="flex flex-wrap items-center gap-3">
				<Button size="sm">Small</Button>
				<Button>Default</Button>
				<Button size="lg">Large</Button>
				<Button size="icon">
					<IconLucide-plus class="size-4" />
				</Button>
			</div>
		</section>

		<Separator />

		<!-- Inputs -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Inputs</h2>
			<div class="flex max-w-sm flex-col gap-3">
				<div class="flex flex-col gap-2">
					<Label for="demo-input">Email</Label>
					<Input id="demo-input" v-model="inputValue" type="email" placeholder="you@example.com" />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="disabled-input">Disabled</Label>
					<Input id="disabled-input" disabled placeholder="Disabled input" />
				</div>
			</div>
		</section>

		<Separator />

		<!-- Cards -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Cards</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Card Title</CardTitle>
						<CardDescription>Card description with supporting text.</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-sm">Card content goes here.</p>
					</CardContent>
					<CardFooter>
						<Button size="sm">Action</Button>
					</CardFooter>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Another Card</CardTitle>
						<CardDescription>With different content.</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="flex flex-wrap gap-2">
							<Badge>Default</Badge>
							<Badge variant="success">Success</Badge>
							<Badge variant="warning">Warning</Badge>
							<Badge variant="destructive">Destructive</Badge>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Stats</CardTitle>
						<CardDescription>Example metric card.</CardDescription>
					</CardHeader>
					<CardContent>
						<p class="text-3xl font-bold">1,234</p>
						<p class="text-sm text-muted-foreground">Total items</p>
					</CardContent>
				</Card>
			</div>
		</section>

		<Separator />

		<!-- Badges -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Badges</h2>
			<div class="flex flex-wrap gap-3">
				<Badge>Default</Badge>
				<Badge variant="destructive">Destructive</Badge>
				<Badge variant="warning">Warning</Badge>
				<Badge variant="success">Success</Badge>
				<Badge variant="secondary">Secondary</Badge>
				<Badge variant="blue">Blue</Badge>
				<Badge variant="indigo">Indigo</Badge>
				<Badge variant="purple">Purple</Badge>
				<Badge variant="pink">Pink</Badge>
				<Badge variant="outline">Outline</Badge>
			</div>
		</section>

		<Separator />

		<!-- Alerts -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Alerts</h2>
			<div class="flex max-w-xl flex-col gap-3">
				<Alert>
					<IconLucide-terminal class="size-4" />
					<AlertTitle>Heads up!</AlertTitle>
					<AlertDescription> You can add components to your app using the CLI. </AlertDescription>
				</Alert>
				<Alert variant="destructive">
					<IconLucide-circle-x class="size-4" />
					<AlertTitle>There were 2 errors with your submission</AlertTitle>
					<AlertDescription>
						<ul class="list-disc space-y-1 pl-5">
							<li>Your password must be at least 8 characters</li>
							<li>Your password must include at least one special character</li>
						</ul>
					</AlertDescription>
				</Alert>
				<Alert variant="warning">
					<IconLucide-triangle-alert class="size-4" />
					<AlertTitle>Attention needed</AlertTitle>
					<AlertDescription>
						Your storage is almost full. Consider upgrading your plan to avoid disruptions.
					</AlertDescription>
				</Alert>
				<Alert variant="success">
					<IconLucide-circle-check class="size-4" />
					<AlertTitle>Order completed</AlertTitle>
					<AlertDescription>
						Your changes have been saved and deployed successfully.
					</AlertDescription>
				</Alert>
				<Alert variant="info">
					<IconLucide-info class="size-4" />
					<AlertTitle>New update available</AlertTitle>
					<AlertDescription>
						A new software update is available. See what's new in version 2.0.4.
					</AlertDescription>
				</Alert>
			</div>
		</section>

		<Separator />

		<!-- Dialog, Sheet & Drawer -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Dialog, Sheet & Drawer</h2>
			<div class="flex flex-wrap gap-3">
				<Dialog v-model:open="dialogOpen">
					<DialogTrigger as-child>
						<Button variant="outline">Open Dialog</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Dialog Title</DialogTitle>
							<DialogDescription>
								This is a dialog built with shadcn-vue and reka-ui primitives.
							</DialogDescription>
						</DialogHeader>
						<div class="py-4">
							<p class="text-sm text-muted-foreground">
								Dialog content goes here. It supports keyboard navigation and focus trapping.
							</p>
						</div>
						<DialogFooter>
							<DialogClose as-child>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button @click="dialogOpen = false">Confirm</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<Sheet v-model:open="sheetOpen">
					<SheetTrigger as-child>
						<Button variant="outline">Open Sheet</Button>
					</SheetTrigger>
					<SheetContent>
						<SheetHeader>
							<SheetTitle>Sheet Title</SheetTitle>
							<SheetDescription> A slide-out panel for secondary content. </SheetDescription>
						</SheetHeader>
						<p class="text-sm text-muted-foreground">
							Sheet content goes here. Great for settings, filters, or detail views.
						</p>
					</SheetContent>
				</Sheet>

				<Drawer v-model:open="drawerOpen">
					<DrawerTrigger as-child>
						<Button variant="outline">Open Drawer</Button>
					</DrawerTrigger>
					<DrawerContent>
						<DrawerHeader>
							<DrawerTitle>Drawer Title</DrawerTitle>
							<DrawerDescription>
								A bottom drawer built with vaul-vue. Swipe down to dismiss.
							</DrawerDescription>
						</DrawerHeader>
						<div class="px-4 pb-4">
							<p class="text-sm text-muted-foreground">
								Drawer content goes here. Ideal for mobile-friendly actions and forms.
							</p>
						</div>
						<DrawerFooter>
							<Button @click="drawerOpen = false">Done</Button>
							<DrawerClose as-child>
								<Button variant="outline">Cancel</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>

				<Button variant="outline" @click="showToast"> Show Toast </Button>
			</div>
		</section>

		<Separator />

		<!-- Dropdown Menu -->
		<section class="flex flex-col items-start gap-4">
			<h2 class="text-2xl font-semibold">Dropdown Menu</h2>
			<DropdownMenu>
				<DropdownMenuTrigger as-child>
					<Button variant="outline">
						Open Menu
						<IconLucide-chevron-down class="ml-2 size-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent class="w-56">
					<DropdownMenuLabel>My Account</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem>
							<IconLucide-user class="mr-2 size-4" />
							Profile
						</DropdownMenuItem>
						<DropdownMenuItem>
							<IconLucide-settings class="mr-2 size-4" />
							Settings
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem>
						<IconLucide-log-out class="mr-2 size-4" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</section>

		<Separator />

		<!-- Select -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Select</h2>
			<div class="flex max-w-sm flex-col gap-3">
				<div class="flex flex-col gap-2">
					<Label for="framework-select">Framework</Label>
					<Select v-model="selectValue">
						<SelectTrigger id="framework-select">
							<SelectValue placeholder="Select a framework" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Frameworks</SelectLabel>
								<SelectItem v-for="fw in frameworks" :key="fw.value" :value="fw.value">
									{{ fw.label }}
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>
				<p class="text-sm text-muted-foreground">Selected: {{ selectValue || 'none' }}</p>
			</div>
		</section>

		<Separator />

		<!-- Combobox -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Combobox</h2>
			<div class="flex max-w-sm flex-col gap-3">
				<div class="flex flex-col gap-2">
					<Label>Framework</Label>
					<Combobox
						v-model="comboboxValue"
						v-model:search-term="comboboxSearch"
						:filter-function="comboboxFilter"
					>
						<ComboboxAnchor>
							<ComboboxInput placeholder="Search frameworks..." />
						</ComboboxAnchor>
						<ComboboxList>
							<ComboboxEmpty>No results found.</ComboboxEmpty>
							<ComboboxGroup>
								<ComboboxItem v-for="fw in frameworks" :key="fw.value" :value="fw">
									{{ fw.label }}
									<ComboboxItemIndicator>
										<IconLucide-check class="ml-auto size-4" />
									</ComboboxItemIndicator>
								</ComboboxItem>
							</ComboboxGroup>
						</ComboboxList>
					</Combobox>
				</div>
				<p class="text-sm text-muted-foreground">Selected: {{ comboboxValue?.label ?? 'none' }}</p>
			</div>
		</section>

		<Separator />

		<!-- Textarea -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Textarea</h2>
			<div class="flex max-w-sm flex-col gap-3">
				<div class="flex flex-col gap-2">
					<Label for="demo-textarea">Message</Label>
					<Textarea id="demo-textarea" placeholder="Type your message here..." />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="disabled-textarea">Disabled</Label>
					<Textarea id="disabled-textarea" disabled placeholder="Disabled textarea" />
				</div>
			</div>
		</section>

		<Separator />

		<!-- Slider -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Slider</h2>
			<div class="flex max-w-sm flex-col gap-6">
				<div class="flex flex-col gap-3">
					<Label>Single value: {{ sliderValue[0] }}</Label>
					<Slider v-model="sliderValue" :max="100" :step="1" />
				</div>
				<div class="flex flex-col gap-3">
					<Label>Range: {{ rangeSliderValue[0] }} – {{ rangeSliderValue[1] }}</Label>
					<Slider v-model="rangeSliderValue" :max="100" :step="1" />
				</div>
			</div>
		</section>

		<Separator />

		<!-- Switch -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Switch</h2>
			<div class="flex max-w-sm flex-col gap-4">
				<div class="flex items-center gap-3">
					<Switch id="airplane-mode" v-model:checked="switchChecked" />
					<Label for="airplane-mode">Airplane Mode</Label>
				</div>
				<p class="text-sm text-muted-foreground">
					{{ switchChecked ? 'On' : 'Off' }}
				</p>
				<div class="flex items-center gap-3">
					<Switch id="disabled-switch" disabled />
					<Label for="disabled-switch" class="text-muted-foreground">Disabled</Label>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Radio Group -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Radio Group</h2>
			<div class="flex max-w-sm flex-col gap-3">
				<Label>Spacing</Label>
				<RadioGroup v-model="radioValue">
					<div class="flex items-center gap-3">
						<RadioGroupItem id="r1" value="default" />
						<Label for="r1">Default</Label>
					</div>
					<div class="flex items-center gap-3">
						<RadioGroupItem id="r2" value="comfortable" />
						<Label for="r2">Comfortable</Label>
					</div>
					<div class="flex items-center gap-3">
						<RadioGroupItem id="r3" value="compact" />
						<Label for="r3">Compact</Label>
					</div>
				</RadioGroup>
				<p class="text-sm text-muted-foreground">Selected: {{ radioValue }}</p>
			</div>
		</section>

		<Separator />

		<!-- Checkbox -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Checkbox</h2>
			<div class="flex max-w-sm flex-col gap-4">
				<div class="flex items-center gap-3">
					<Checkbox id="terms" v-model:checked="termsChecked" />
					<Label for="terms">Accept terms and conditions</Label>
				</div>
				<div class="flex items-center gap-3">
					<Checkbox id="marketing" v-model:checked="marketingChecked" />
					<Label for="marketing">Receive marketing emails</Label>
				</div>
				<div class="flex items-center gap-3">
					<Checkbox id="disabled-cb" disabled />
					<Label for="disabled-cb" class="text-muted-foreground">Disabled</Label>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Toggle Group -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Toggle Group</h2>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-2">
					<Label>Text alignment</Label>
					<ToggleGroup v-model="toggleGroupValue" type="single">
						<ToggleGroupItem value="left" aria-label="Align left">
							<IconLucide-align-left class="size-4" />
						</ToggleGroupItem>
						<ToggleGroupItem value="center" aria-label="Align center">
							<IconLucide-align-center class="size-4" />
						</ToggleGroupItem>
						<ToggleGroupItem value="right" aria-label="Align right">
							<IconLucide-align-right class="size-4" />
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
				<div class="flex flex-col gap-2">
					<Label>Outline variant</Label>
					<ToggleGroup type="single" variant="outline" default-value="center">
						<ToggleGroupItem value="left" aria-label="Align left">
							<IconLucide-align-left class="size-4" />
						</ToggleGroupItem>
						<ToggleGroupItem value="center" aria-label="Align center">
							<IconLucide-align-center class="size-4" />
						</ToggleGroupItem>
						<ToggleGroupItem value="right" aria-label="Align right">
							<IconLucide-align-right class="size-4" />
						</ToggleGroupItem>
					</ToggleGroup>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Tabs -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Tabs</h2>
			<div class="max-w-md">
				<Tabs default-value="account">
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="account">Account</TabsTrigger>
						<TabsTrigger value="password">Password</TabsTrigger>
					</TabsList>
					<TabsContent value="account">
						<Card>
							<CardHeader>
								<CardTitle>Account</CardTitle>
								<CardDescription>Make changes to your account here.</CardDescription>
							</CardHeader>
							<CardContent class="flex flex-col gap-3">
								<div class="flex flex-col gap-2">
									<Label for="tab-name">Name</Label>
									<Input id="tab-name" value="Pedro Duarte" />
								</div>
								<div class="flex flex-col gap-2">
									<Label for="tab-username">Username</Label>
									<Input id="tab-username" value="@peduarte" />
								</div>
							</CardContent>
							<CardFooter>
								<Button>Save changes</Button>
							</CardFooter>
						</Card>
					</TabsContent>
					<TabsContent value="password">
						<Card>
							<CardHeader>
								<CardTitle>Password</CardTitle>
								<CardDescription>Change your password here.</CardDescription>
							</CardHeader>
							<CardContent class="flex flex-col gap-3">
								<div class="flex flex-col gap-2">
									<Label for="tab-current">Current password</Label>
									<Input id="tab-current" type="password" />
								</div>
								<div class="flex flex-col gap-2">
									<Label for="tab-new">New password</Label>
									<Input id="tab-new" type="password" />
								</div>
							</CardContent>
							<CardFooter>
								<Button>Save password</Button>
							</CardFooter>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</section>

		<Separator />

		<!-- Table -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Table</h2>
			<div class="rounded-md border">
				<Table>
					<UiTableHeader>
						<UiTableRow>
							<TableHead class="w-[100px]">Invoice</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Method</TableHead>
							<TableHead class="text-right">Amount</TableHead>
						</UiTableRow>
					</UiTableHeader>
					<UiTableBody>
						<UiTableRow v-for="inv in invoices" :key="inv.invoice">
							<TableCell class="font-medium">{{ inv.invoice }}</TableCell>
							<TableCell>
								<Badge
									:variant="
										inv.status === 'Paid'
											? 'success'
											: inv.status === 'Pending'
												? 'warning'
												: 'destructive'
									"
								>
									{{ inv.status }}
								</Badge>
							</TableCell>
							<TableCell>{{ inv.method }}</TableCell>
							<TableCell class="text-right">{{ inv.amount }}</TableCell>
						</UiTableRow>
					</UiTableBody>
				</Table>
			</div>
		</section>

		<Separator />

		<!-- Scroll Area -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Scroll Area</h2>
			<div class="flex flex-col gap-6 sm:flex-row">
				<div class="flex flex-col gap-2">
					<Label>Vertical</Label>
					<ScrollArea class="h-48 w-48 rounded-md border p-4">
						<div class="flex flex-col gap-2">
							<div v-for="tag in 20" :key="tag" class="text-sm">Tag {{ tag }}</div>
						</div>
					</ScrollArea>
				</div>
				<div class="flex flex-col gap-2">
					<Label>Horizontal</Label>
					<ScrollArea class="w-72 rounded-md border">
						<div class="flex gap-4 p-4">
							<div
								v-for="i in 12"
								:key="i"
								class="flex size-20 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-medium"
							>
								{{ i }}
							</div>
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Spinner -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Spinner</h2>
			<div class="flex items-center gap-6">
				<div class="flex flex-col items-center gap-2">
					<Spinner class="size-4" />
					<span class="text-xs text-muted-foreground">sm</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<Spinner class="size-6" />
					<span class="text-xs text-muted-foreground">md</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<Spinner class="size-8" />
					<span class="text-xs text-muted-foreground">lg</span>
				</div>
				<Button disabled>
					<Spinner class="size-4" />
					Loading...
				</Button>
			</div>
		</section>

		<Separator />

		<!-- Stepper -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Stepper</h2>
			<div class="max-w-lg">
				<Stepper v-model="stepperValue">
					<StepperItem :step="1" class="flex-1">
						<StepperTrigger>
							<StepperIndicator>1</StepperIndicator>
						</StepperTrigger>
						<div class="flex flex-col">
							<StepperTitle>Details</StepperTitle>
							<StepperDescription>Enter your details</StepperDescription>
						</div>
						<StepperSeparator />
					</StepperItem>
					<StepperItem :step="2" class="flex-1">
						<StepperTrigger>
							<StepperIndicator>2</StepperIndicator>
						</StepperTrigger>
						<div class="flex flex-col">
							<StepperTitle>Review</StepperTitle>
							<StepperDescription>Review your info</StepperDescription>
						</div>
						<StepperSeparator />
					</StepperItem>
					<StepperItem :step="3" class="flex-1">
						<StepperTrigger>
							<StepperIndicator>3</StepperIndicator>
						</StepperTrigger>
						<div class="flex flex-col">
							<StepperTitle>Confirm</StepperTitle>
							<StepperDescription>Submit your data</StepperDescription>
						</div>
					</StepperItem>
				</Stepper>
				<div class="mt-4 flex gap-2">
					<Button variant="outline" size="sm" :disabled="stepperValue <= 1" @click="stepperValue--">
						Previous
					</Button>
					<Button size="sm" :disabled="stepperValue >= 3" @click="stepperValue++"> Next </Button>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Icons -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Lucide Icons</h2>
			<p class="text-sm text-muted-foreground">
				Auto-imported via unplugin-icons as
				<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs"
					>&lt;IconLucide-{name} /&gt;</code
				>
			</p>
			<div class="flex flex-wrap gap-4">
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-home class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">home</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-search class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">search</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-heart class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">heart</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-star class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">star</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-bell class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">bell</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-mail class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">mail</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-calendar class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">calendar</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-camera class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">camera</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-cloud class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">cloud</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-download class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">download</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-upload class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">upload</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-trash-2 class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">trash-2</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-edit class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">edit</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-check class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">check</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-x class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">x</span>
				</div>
				<div class="flex flex-col items-center gap-1">
					<div class="flex size-10 items-center justify-center rounded-md border border-border">
						<IconLucide-arrow-right class="size-5" />
					</div>
					<span class="text-xs text-muted-foreground">arrow-right</span>
				</div>
			</div>
		</section>

		<Separator />

		<!-- Color Palette -->
		<section class="flex flex-col gap-4">
			<h2 class="text-2xl font-semibold">Color Palette</h2>
			<p class="text-sm text-muted-foreground">
				Theme colors via CSS variables. Automatically adapts to light/dark mode.
			</p>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div
					v-for="color in colorSwatches"
					:key="color.name"
					:class="[
						color.var,
						color.text,
						'flex flex-col gap-1 rounded-lg border border-border p-4',
					]"
				>
					<span class="text-sm font-medium">{{ color.name }}</span>
					<span class="text-xs opacity-70">var(--{{ color.name }})</span>
				</div>
			</div>
		</section>
	</div>
</template>
