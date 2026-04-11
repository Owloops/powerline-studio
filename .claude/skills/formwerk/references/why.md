# Why Formwerk?

## A Balance of Abstraction and Control

Forms must handle data collection, validation, interaction, and accessibility. Existing solutions force developers to choose between:

- **Low-level abstraction** — requires extensive custom code for accessibility, behavior, i18n
- **High-level UI libraries** — limits markup and styling control

Formwerk occupies the middle ground: composables that handle the hard parts while you keep full control over markup and styling.

## So, Only JavaScript?

Formwerk makes opinionated choices about JavaScript behavior:

- **Configurable:** Some behaviors like mouse wheel interactions on number fields
- **Non-configurable:** Keyboard interactions for checkboxes, select field navigation — these are fixed because changing them would hurt users

The philosophy: prioritize user experience over configurability for interaction patterns.

## What You Get

Formwerk composables provide:

- **Accessibility** — First-class support with meticulous attention to common ARIA patterns
- **Adaptive API** — Flexible approaches to building forms with various configurations
- **Value tracking** — Collection and management of form data across input and non-input elements
- **Standard behavior** — Custom components behave identically to native HTML equivalents
- **Multi-level validation** — Native HTML constraints plus custom schemas (Yup, Zod, Standard Schema)
- **Internationalization** — Built-in i18n and RTL support, including different numbering systems, date formats, calendars
- **Consistent API** — Unified approach across simple and complex components

**No UI, no styles, no markup** — you build these yourself.

## Who Is Formwerk For?

**Target audience:**

- Design system builders
- UI library developers
- Anyone needing foundational form infrastructure without styling/markup lock-in

**Not ideal for:**

- Those using existing UI libraries that already include form components
- Rapid prototyping where visual output matters immediately

## Comparison with Alternatives

### vs vee-validate

vee-validate is lower-level for building form components. It handles validation well but lacks coverage for accessibility, internationalization, interaction, and behaviors — requiring users to combine it with other libraries.

### vs FormKit

FormKit provides comprehensive features including UI, but UI is personal and should be tailored to your brand. FormKit's "reward early, punish later" model accelerates initial development but creates friction if redesign becomes necessary. Formwerk inverts this: as easy to dismantle as it is to build with.

### vs Vuelidate

Vuelidate has the lowest level of abstraction. It offers validation but requires developers to implement everything else themselves.

### vs TanStack Forms

Both embrace headless design, but TanStack Forms operates on the lower end of the abstraction scale. It provides tools for building fields but doesn't address each field's unique needs in terms of accessibility, interaction, and behavior.

Formwerk distinguishes itself through broader internationalization support — beyond just localized messages, it ensures international users can interact with forms naturally: different numbering systems, various date formats and calendars, and more.
