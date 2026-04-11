<script setup lang="ts">
import { useForm } from '@formwerk/core'
import { z } from 'zod'
import { toast } from 'vue-sonner'

useHead({ title: 'Forms' })
useSeoMeta({
	title: 'Forms — Vue Template',
	description: 'Complex multi-section form with FormWerk composables and Zod schema validation',
})

const schema = z.object({
	username: z
		.string()
		.min(3, 'Username must be at least 3 characters')
		.max(20, 'Username must be at most 20 characters')
		.regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
	about: z.string().max(500, 'Bio must be at most 500 characters').optional(),
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	email: z.string().email('Please enter a valid email address'),
	phone: z
		.string()
		.regex(/^\+?[\d\s-()]+$/, 'Please enter a valid phone number')
		.optional()
		.or(z.literal('')),
	country: z.string().min(1, 'Please select a country'),
	streetAddress: z.string().min(1, 'Street address is required'),
	city: z.string().min(1, 'City is required'),
	region: z.string().min(1, 'State / Province is required'),
	postalCode: z
		.string()
		.min(1, 'ZIP / Postal code is required')
		.regex(/^[\dA-Za-z\s-]+$/, 'Please enter a valid postal code'),
	notifyComments: z.boolean().optional(),
	notifyCandidates: z.boolean().optional(),
	notifyOffers: z.boolean().optional(),
	pushNotifications: z.string().optional(),
	marketingEmails: z.boolean().optional(),
})

const countries = [
	{ label: 'United States', value: 'us' },
	{ label: 'Canada', value: 'ca' },
	{ label: 'United Kingdom', value: 'gb' },
	{ label: 'Germany', value: 'de' },
	{ label: 'France', value: 'fr' },
	{ label: 'Japan', value: 'jp' },
	{ label: 'Australia', value: 'au' },
	{ label: 'Norway', value: 'no' },
	{ label: 'Finland', value: 'fi' },
	{ label: 'Iceland', value: 'is' },
]

const { handleSubmit } = useForm({
	schema,
	initialValues: {
		username: '',
		about: '',
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		country: '',
		streetAddress: '',
		city: '',
		region: '',
		postalCode: '',
		notifyComments: true,
		notifyCandidates: false,
		notifyOffers: false,
		pushNotifications: 'email',
		marketingEmails: false,
	},
})

const submittedData = ref<Record<string, unknown> | null>(null)

const onSubmit = handleSubmit((data) => {
	const values = data.toObject()
	submittedData.value = values
	toast.success('Profile saved', {
		description: `Welcome, ${values.firstName} ${values.lastName}!`,
	})
})
</script>

<template>
	<div class="flex flex-col gap-12">
		<section>
			<h1 class="text-3xl font-bold tracking-tight">Forms</h1>
			<p class="mt-2 text-muted-foreground">
				Multi-section form with FormWerk composables and Zod schema validation.
			</p>
		</section>

		<ClientOnly>
			<form class="max-w-2xl" novalidate @submit="onSubmit">
				<div class="flex flex-col gap-12">
					<!-- Profile Section -->
					<section class="flex flex-col gap-8 border-b border-border pb-12">
						<div>
							<h2 class="text-base/7 font-semibold">Profile</h2>
							<p class="mt-1 text-sm/6 text-muted-foreground">
								This information will be displayed publicly so be careful what you share.
							</p>
						</div>

						<div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
							<div class="sm:col-span-4">
								<FormTextField name="username" label="Username" placeholder="janedoe" />
							</div>

							<div class="col-span-full">
								<FormTextareaField
									name="about"
									label="About"
									description="Write a few sentences about yourself."
									:rows="4"
								/>
							</div>

							<div class="col-span-full">
								<Label class="text-sm font-medium">Photo</Label>
								<div class="mt-2 flex items-center gap-x-3">
									<div class="flex size-12 items-center justify-center rounded-full bg-muted">
										<IconLucide-user class="size-6 text-muted-foreground" />
									</div>
									<Button type="button" variant="outline" size="sm">Change</Button>
								</div>
							</div>

							<div class="col-span-full">
								<Label class="text-sm font-medium">Cover photo</Label>
								<div
									class="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10"
								>
									<div class="text-center">
										<IconLucide-image class="mx-auto size-12 text-muted-foreground/50" />
										<div class="mt-4 flex text-sm/6 text-muted-foreground">
											<label
												for="file-upload"
												class="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
											>
												<span>Upload a file</span>
												<input id="file-upload" name="file-upload" type="file" class="sr-only" />
											</label>
											<p class="pl-1">or drag and drop</p>
										</div>
										<p class="text-xs/5 text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
									</div>
								</div>
							</div>
						</div>
					</section>

					<!-- Personal Information Section -->
					<section class="flex flex-col gap-8 border-b border-border pb-12">
						<div>
							<h2 class="text-base/7 font-semibold">Personal Information</h2>
							<p class="mt-1 text-sm/6 text-muted-foreground">
								Use a permanent address where you can receive mail.
							</p>
						</div>

						<div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
							<div class="sm:col-span-3">
								<FormTextField
									name="firstName"
									label="First name"
									placeholder="Jane"
									autocomplete="given-name"
								/>
							</div>

							<div class="sm:col-span-3">
								<FormTextField
									name="lastName"
									label="Last name"
									placeholder="Doe"
									autocomplete="family-name"
								/>
							</div>

							<div class="sm:col-span-4">
								<FormTextField
									name="email"
									label="Email address"
									type="email"
									placeholder="jane@example.com"
									autocomplete="email"
								/>
							</div>

							<div class="sm:col-span-2">
								<FormTextField
									name="phone"
									label="Phone"
									type="tel"
									placeholder="+1 (555) 000-0000"
									autocomplete="tel"
								/>
							</div>

							<div class="sm:col-span-3">
								<FormSelectField
									name="country"
									label="Country"
									:options="countries"
									placeholder="Select a country"
								/>
							</div>

							<div class="col-span-full">
								<FormTextField
									name="streetAddress"
									label="Street address"
									autocomplete="street-address"
								/>
							</div>

							<div class="sm:col-span-2 sm:col-start-1">
								<FormTextField name="city" label="City" autocomplete="address-level2" />
							</div>

							<div class="sm:col-span-2">
								<FormTextField
									name="region"
									label="State / Province"
									autocomplete="address-level1"
								/>
							</div>

							<div class="sm:col-span-2">
								<FormTextField
									name="postalCode"
									label="ZIP / Postal code"
									autocomplete="postal-code"
								/>
							</div>
						</div>
					</section>

					<!-- Notifications Section -->
					<section class="flex flex-col gap-8 border-b border-border pb-12">
						<div>
							<h2 class="text-base/7 font-semibold">Notifications</h2>
							<p class="mt-1 text-sm/6 text-muted-foreground">
								We'll always let you know about important changes, but you pick what else you want
								to hear about.
							</p>
						</div>

						<div class="flex flex-col gap-10">
							<fieldset>
								<legend class="text-sm/6 font-semibold">By email</legend>
								<div class="mt-4 flex flex-col gap-4">
									<FormCheckboxField
										name="notifyComments"
										label="Comments"
										description="Get notified when someone posts a comment on a posting."
									/>
									<FormCheckboxField
										name="notifyCandidates"
										label="Candidates"
										description="Get notified when a candidate applies for a job."
									/>
									<FormCheckboxField
										name="notifyOffers"
										label="Offers"
										description="Get notified when a candidate accepts or rejects an offer."
									/>
								</div>
							</fieldset>

							<fieldset>
								<legend class="text-sm/6 font-semibold">Push notifications</legend>
								<p class="mt-1 text-sm/6 text-muted-foreground">
									These are delivered via SMS to your mobile phone.
								</p>
								<RadioGroup default-value="email" class="mt-4 gap-4" @update:model-value="() => {}">
									<div class="flex items-center gap-x-3">
										<RadioGroupItem id="push-everything" value="everything" />
										<Label for="push-everything">Everything</Label>
									</div>
									<div class="flex items-center gap-x-3">
										<RadioGroupItem id="push-email" value="email" />
										<Label for="push-email">Same as email</Label>
									</div>
									<div class="flex items-center gap-x-3">
										<RadioGroupItem id="push-nothing" value="nothing" />
										<Label for="push-nothing">No push notifications</Label>
									</div>
								</RadioGroup>
							</fieldset>

							<div class="flex flex-col gap-4">
								<FormSwitchField name="marketingEmails" label="Marketing emails" />
							</div>
						</div>
					</section>
				</div>

				<!-- Form Actions -->
				<div class="mt-6 flex items-center justify-end gap-x-3">
					<Button type="button" variant="ghost">Cancel</Button>
					<Button type="submit">Save</Button>
				</div>
			</form>

			<div v-if="submittedData" class="mt-8 max-w-2xl rounded-lg border border-border bg-muted p-4">
				<h3 class="mb-2 text-sm font-medium">Submitted Data</h3>
				<pre class="text-xs tabular-nums">{{ JSON.stringify(submittedData, null, 2) }}</pre>
			</div>
		</ClientOnly>
	</div>
</template>
