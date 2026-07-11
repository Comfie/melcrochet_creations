# MelCrochet Gifted Hands — Admin Panel Design Spec

**Date:** 2026-07-11
**Status:** Approved
**Author:** Design brainstorm (Comfort + Claude)

## 1. Overview

The admin panel lets Melissa manage her product catalogue, testimonials, blog
posts, and customer enquiries without touching code. It lives at `/admin` in the
same Next.js app, gated by the existing JWT cookie auth system.

### What already exists

The entire backend is built:

- **Auth:** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
  with JWT cookie (`mc_admin`, 7-day expiry, HttpOnly/Secure/Lax)
- **Route gate:** `proxy.ts` verifies the JWT on `/admin/*` (except `/admin/login`)
  and redirects unauthenticated requests to the login page
- **CRUD route handlers:** products, categories, testimonials, blog posts,
  enquiries — all auth-protected with `requireAuth()`
- **Uploads:** `POST /api/uploads` — auth-protected, image-only, 5MB cap,
  Cloudinary storage
- **Zod schemas:** input validation for all resources
- **Cloudinary helpers:** `uploadImageBuffer()` and `deleteImage()` in
  `lib/cloudinary.ts`

### What this plan builds

The admin UI — all `"use client"` pages and components that consume the
existing API layer:

- Login page
- Admin layout (sidebar + auth gate)
- Products management (CRUD + image upload)
- Testimonials management (CRUD + optional photo)
- Blog management (CRUD + Markdown preview + cover image + YouTube URL)
- Enquiries management (read-only, status transitions)
- Shared admin components (slide-over, image upload, toast, etc.)

### Out of scope

- Category management UI (categories stay seed-managed)
- Analytics dashboard
- WYSIWYG rich-text editor (blog uses Markdown)
- Bulk import/export
- Multi-admin roles
- Product image gallery (single image per product)

## 2. Architecture

### Data fetching approach

Plain `fetch()` + `useState` — no external state library. Each admin page is a
`"use client"` component that calls the existing `/api/*` endpoints. A small
shared `useApiList` / `useApiMutation` hook DRYs up the repeated
fetch/loading/error patterns.

This is the right weight for a single-admin app with 4 CRUD screens. The full
API layer already exists; the admin UI is purely a consumer.

### File structure

```
app/admin/
├── login/page.tsx           Login form
├── layout.tsx               Sidebar + auth gate (client component)
├── products/page.tsx        Product CRUD
├── testimonials/page.tsx    Testimonial CRUD
├── blog/page.tsx            Blog authoring
└── enquiries/page.tsx       Enquiry inbox

components/admin/
├── SlideOver.tsx             Reusable slide-over panel
├── ImageUpload.tsx           Drag-and-drop/click image upload zone
├── ConfirmDialog.tsx         Delete confirmation modal
├── Toast.tsx                 Auto-dismissing notification
├── AdminTable.tsx            Consistent table styling
└── StatusBadge.tsx           Colored status pill

hooks/
├── use-api-list.ts           Fetch-on-mount list hook
└── use-api-mutation.ts       Mutation with loading/error state
```

### Theme

Brand-tinted neutral:
- **Sidebar:** `bg-ink` (#151515) with `text-cream` labels and `text-gold`
  active link accent
- **Content workspace:** `bg-white` for readability, data-dense screens stay
  clean
- **Buttons/accents:** gold (#C8A24A) primary buttons with ink text
- **Headings:** Fraunces used sparingly (section titles, sidebar brand name)
- **Body text:** Inter throughout

## 3. Login Page

**Route:** `/admin/login`

Excluded from the sidebar layout (the layout's auth check skips this path,
matching `proxy.ts`'s passthrough).

### Design

- Centered card on `bg-cream` background
- MelCrochet brand name at top (Fraunces heading)
- Two fields: Username, Password
- "Sign In" button (`bg-gold text-ink`, hover darken)
- Error state: inline message below the button ("Invalid credentials")
- Loading state: button disabled with spinner during the API call

### Behaviour

- Submits `POST /api/auth/login` with `{ username, password }`
- On 200: cookie set by response, `router.push("/admin/products")`
- On 401: shows "Invalid credentials" error
- No "remember me" — JWT already lasts 7 days

## 4. Admin Layout & Auth Gate

**File:** `app/admin/layout.tsx` — a `"use client"` layout.

### Auth gate

1. On mount, calls `GET /api/auth/me` to verify the session
2. If unauthenticated and not on `/admin/login`, redirects to `/admin/login`
3. If authenticated, renders the sidebar + content area

### Sidebar (fixed left, ~240px on desktop)

- "MelCrochet Admin" heading at top (Fraunces, brand ink background)
- Nav links with icons: Products, Testimonials, Blog, Enquiries
- Enquiries link shows a badge with the count of NEW enquiries
- Active link highlighted with gold accent
- Logout button at bottom — calls `POST /api/auth/logout`, clears state,
  redirects to login

### Mobile (<768px)

Sidebar collapses to a hamburger icon in a top bar. Tapping opens a
slide-out drawer overlay.

### Content area

White (`bg-white`) background, scrollable, with a top bar showing the current
section name.

## 5. Products Management

**Route:** `/admin/products` — the default admin landing page.

### List view

- Table with columns: Image (thumbnail), Name, Category, Price, Status
  (Active/Inactive), Featured badge
- "Add Product" button top-right
- Category filter dropdown above the table to narrow the list
- All products shown (including inactive, dimmed with visual indicator)
- Click a row to open the edit slide-over
- Sorted by `sortOrder` ascending

### Slide-over panel (add + edit, ~480px wide)

Slides in from the right, overlay dims the list behind.

Form fields:
- **Name** — text input (required)
- **Category** — dropdown select from `GET /api/categories` (required)
- **Description** — textarea (required)
- **Price Type** — radio: FIXED or QUOTE
- **Price** — number input, shown only when FIXED selected (required then)
- **Sizes** — text input (optional, free text)
- **Colours** — text input (optional, free text)
- **Lead Time** — text input (optional)
- **Image** — drag-and-drop/click-to-browse zone. Shows current thumbnail in
  edit mode. Uploads via `POST /api/uploads`, stores returned `url` and
  `publicId`
- **Featured** — checkbox toggle
- **Active** — checkbox toggle (edit only)
- **Sort Order** — number input

### Actions

- **Save** → `POST /api/products` (create) or `PATCH /api/products/:id` (update)
- **Delete** (edit only) → `DELETE /api/products/:id` (soft-delete, sets
  `isActive: false`), with confirmation dialog
- Validation errors inline next to fields (mirrors Zod schema constraints)
- On success: close panel, refresh list, show toast ("Product saved")

## 6. Testimonials Management

**Route:** `/admin/testimonials`

### List view

- Table with columns: Photo (avatar), Customer Name, Quote (truncated),
  Rating (stars), Status
- "Add Testimonial" button top-right
- Inactive testimonials dimmed

### Slide-over panel (add + edit)

Form fields:
- **Customer Name** — text input (required)
- **Quote** — textarea (required)
- **Location** — text input (optional, e.g. "Johannesburg")
- **Product Name** — text input (optional, free text reference)
- **Rating** — clickable star selector, 1–5 (optional, null = no rating shown)
- **Image** — same upload zone as products
- **Active** — checkbox toggle (edit only)
- **Sort Order** — number input

### Actions

- **Save** → `POST /api/testimonials` or `PATCH /api/testimonials/:id`
- **Delete** (edit only) → `DELETE /api/testimonials/:id` (soft-delete), with
  confirmation
- Same toast feedback and inline validation pattern

## 7. Blog Management

**Route:** `/admin/blog`

### List view

- Table with columns: Cover Image (thumbnail), Title, Status (Draft/Published),
  Published Date, Created Date
- "New Post" button top-right
- Draft posts with "Draft" badge, published with "Published" badge
- Sorted by `createdAt` descending (newest first)

### Slide-over panel (add + edit, ~560px wide — wider for Markdown)

Form fields:
- **Title** — text input (required)
- **Excerpt** — textarea, short summary for cards/SEO (optional)
- **Cover Image** — same upload zone
- **YouTube URL** — text input (optional)
- **Content** — large textarea with Write/Preview toggle tabs:
  - **Write tab:** plain textarea, ~300px min height
  - **Preview tab:** renders Markdown with `react-markdown`, same prose styling
    as the public blog page so Melissa sees what readers see
- **Published** — toggle switch. First publish sets `publishedAt` automatically
  (handled by the API)

### Actions

- **Save** → `POST /api/blog` or `PATCH /api/blog/:id`
- **Delete** (edit only) → `DELETE /api/blog/:id` (hard delete, matching the
  existing API), with confirmation
- Same toast feedback and inline validation

## 8. Enquiries Management

**Route:** `/admin/enquiries`

### List view

- Table with columns: Name, Email, Phone, Message (truncated), Status
  (NEW/READ/ARCHIVED), Date
- No "Add" button — enquiries are inbound only
- NEW enquiries visually distinguished: bold text or gold dot indicator
- Status filter tabs above the table: All, New, Read, Archived — each with
  counts (e.g. "New (3)")
- Sidebar nav link shows badge with NEW count
- Sorted by `createdAt` descending

### Interaction — inline expand (no slide-over)

- Click a row to expand it inline, showing the full message text
- Expanding a NEW enquiry automatically marks it READ via
  `PATCH /api/enquiries/:id { status: "READ" }`
- "Archive" button on expanded rows →
  `PATCH /api/enquiries/:id { status: "ARCHIVED" }`
- No edit or delete — enquiries are read-only data

## 9. Shared Components

### Hooks (`hooks/`)

**`useApiList(url)`** — fetches a list on mount, returns
`{ data, loading, error, refresh }`. All admin list pages use this.

**`useApiMutation()`** — returns a `mutate(url, options)` function with
loading state, error extraction, and success callback. Used for all
create/update/delete operations.

### Admin components (`components/admin/`)

**`SlideOver`** — reusable panel shell:
- Slides in from the right with an overlay backdrop
- Close via X button, click-outside, or Escape key
- Accepts `width` prop (default ~480px, ~560px for blog)

**`ImageUpload`** — drag-and-drop/click-to-browse zone:
- Handles `POST /api/uploads` internally
- Shows thumbnail preview of current/uploaded image
- Loading spinner during upload
- Used by Products, Testimonials, and Blog

**`ConfirmDialog`** — small centered modal:
- "Are you sure?" with confirm/cancel buttons
- Used for delete confirmations

**`Toast`** — brief notification:
- Auto-dismisses after a few seconds
- Anchored top-right of the content area
- Success (green) and error (red) variants

**`AdminTable`** — lightweight table wrapper:
- Consistent row hover, truncated text cells
- Responsive horizontal scroll on mobile

**`StatusBadge`** — colored pill:
- Active/Inactive, Draft/Published, NEW/READ/ARCHIVED
- Color-coded per status type

## 10. Error Handling

Consistent pattern across all admin screens:

- **401 from any API call** → session expired, redirect to `/admin/login`
- **4xx with `{ error }` body** → show the error message in toast or inline
  on the form field
- **Network failure** → generic "Something went wrong" toast
- **Form validation** → inline errors next to fields before submission
  (client-side mirrors Zod constraints), plus server-side errors displayed
  on 400 response

## 11. Build Order

1. Shared hooks (`useApiList`, `useApiMutation`)
2. Shared components (`SlideOver`, `ImageUpload`, `ConfirmDialog`, `Toast`,
   `AdminTable`, `StatusBadge`)
3. Login page
4. Admin layout (sidebar + auth gate)
5. Products page (the most complex CRUD screen — proves the patterns)
6. Testimonials page (simpler variant of the same patterns)
7. Blog page (Markdown preview is the main addition)
8. Enquiries page (simplest — read-only + status)
