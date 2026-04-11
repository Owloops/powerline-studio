---
name: pages
description: Organize and refactor page components and file-based routes in app/pages or src/pages. Use when restructuring routes, creating route groups, organizing pages by feature, or working with Vue Router or Nuxt projects. Keywords route, page, routing, navigation, file-based routing, page structure.
metadata:
  author: Eduardo San Martin Morote <posva13@gmail.com>
  version: '1.0.0'
license: Proprietary - see repository LICENSE.txt
---

# Router and page components

`app/pages` (Nuxt project) or `src/pages` contains the routes of the application using Vue Router (Nuxt uses Vue Router under the hood). The routes are defined in a file-based manner: the structure of the files and folders directly corresponds to the routes of the application.

## Instructions

- Fetch <https://uvr.esm.is/llms.txt> and follow links ONLY to get up to date information on topics not covered here
- AVOID files named `index.vue`, instead use a group and give them a meaningful name like `pages/(home).vue`
- ALWAYS use explicit names for route params: prefer `userId` over `id`, `postSlug` over `slug`, etc.
- Use double brackets `[[paramName]]` for optional route parameters
- Use the `+` modifier after a closing bracket `]` to make a parameter repeatable: `/posts.[[slug]]+.vue` matches `/posts/some-posts` and `/posts/some/post`
- Use `[...path]` to match anything, event slashes (`/`)
- You can have multiple sub segments in a file, e.g. `@[username]` -> `/@posva`, `with-[name]-[lastName]` -> `/with-eduardo-san_martin_morote`
- Within a page component, use `definePage()` to customize the route's properties like `meta`, `name`, `path`, `alias`, etc
- ALWAYS refer to the `typed-router.d.ts` file to find route names and parameters
- Prefer named route locations for type safety and clarity, e.g., `router.push({ name: '/users/[userId]', params: { userId } })` rather than `router.push('/users/' + userId)`
- Pass the name of the route to `useRoute('/users/[userId]')` to get stricter types
- Nest folders based on the slashes in the URL structure: `projects/[user]/[name].vue`
- Use `.` in filenames to create `/` without route nesting: `users.edit.vue` -> `/users/edit`
- Create nested layouts by creating a component with the same name as the folder, e.g., `users.vue` for the `users/` folder
  - The parent page (e.g. `users.vue`) must have a `<RouterView />` / `<NuxtPage />`

## Example

### Basic File Structure

```
src/pages/
├── (home).vue # groups give more descriptive names to routes
├── about.vue
├── [...path].vue # Catch-all route for not found pages
├── users.edit.vue # use `.` to break out of layouts
├── users.vue # Layout for all routes in users/ (nested routes of user.vue)
└── users/
    ├── (user-list).vue
    └── [userId].vue
```

### Route groups

Route groups can also create shared layouts without interfering with the generated URL:

```
src/pages/
├── (admin).vue # layout for all admin routes, does not affect other pages
├── (admin)/
│   ├── dashboard.vue
│   └── settings.vue
└── (user)/
    ├── profile.vue
    └── order.vue
```

Resulting URLs:

- `/dashboard` -> renders `src/pages/(admin)/dashboard.vue`
- `/settings` -> renders `src/pages/(admin)/settings.vue`
- `/profile` -> renders `src/pages/(user)/profile.vue`
- `/order` -> renders `src/pages/(user)/order.vue`
