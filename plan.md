# Library Management System — Frontend Plan

## 1. Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | React 19 + Vite | Fast HMR, modern tooling |
| Language | TypeScript | Type safety across all API calls and models |
| Styling | Tailwind CSS v4 | Utility-first, consistent design tokens |
| Component Library | shadcn/ui | Accessible, unstyled base components |
| Routing | React Router v7 | Nested layouts, protected routes |
| State / Server Cache | TanStack Query v5 | Caching, pagination, background refetch for REST API |
| Forms | React Hook Form + Zod | Schema-driven validation mirroring backend constraints |
| HTTP Client | Axios (instance with interceptors) | Centralized JWT attachment and error handling |
| Auth | Context + localStorage JWT | Stateless, mirrors backend session model |
| Tables / Pagination | TanStack Table v8 | Server-side pagination, sorting |
| Date Handling | date-fns | Lightweight, tree-shakeable |
| Icons | Lucide React | Consistent icon set |
| Notifications | Sonner (toast) | Clean, accessible toasts |

---

## 2. Project Structure

```
LMS-frontend/
├── public/
├── src/
│   ├── api/                  # One file per resource (books.ts, users.ts, …)
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (Button, Dialog, Table, …)
│   │   ├── layout/           # Sidebar, Navbar, PageShell, BreadcrumbBar
│   │   └── shared/           # DataTable, Pagination, ConfirmDialog, StatusBadge
│   ├── features/             # Feature-sliced modules
│   │   ├── auth/
│   │   ├── books/
│   │   ├── authors/
│   │   ├── genres/
│   │   ├── publishers/
│   │   ├── book-copies/
│   │   ├── users/
│   │   ├── librarians/
│   │   ├── borrowed/
│   │   ├── fines/
│   │   └── payments/
│   ├── hooks/                # useAuth, usePagination, useDebounce
│   ├── lib/                  # axios instance, queryClient, zod schemas
│   ├── routes/               # Route definitions, protected wrappers
│   ├── types/                # Shared TypeScript interfaces mirroring DTOs
│   └── main.tsx
├── .env.local                # VITE_API_BASE_URL=http://localhost:8080
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

Each feature folder follows this sub-structure:
```
features/books/
├── api.ts          # TanStack Query hooks (useBooks, useBook, useCreateBook, …)
├── columns.tsx     # TanStack Table column definitions
├── schemas.ts      # Zod schemas matching backend DTO constraints
├── BookList.tsx
├── BookDetail.tsx
├── BookForm.tsx    # Create + Edit (shared)
└── index.ts
```

---

## 3. User Roles & Portal Separation

The backend has three roles: **ADMIN**, **STAFF**, **USER**.

The frontend surfaces two distinct portals behind a single login page:

| Portal | Entry Point | Available To |
|---|---|---|
| **Member Portal** | `/app/*` | USER role |
| **Staff Portal** | `/staff/*` | STAFF + ADMIN roles |

After login, the JWT payload's role determines which portal to redirect to. Route guards enforce this.

---

## 4. Page Inventory

### Public Pages
| Route | Page |
|---|---|
| `/` | Landing / Home (features, CTA) |
| `/login` | Unified login (user vs librarian toggle) |
| `/register` | Member self-registration |

### Member Portal (`/app`)
| Route | Page | Key Actions |
|---|---|---|
| `/app` | Dashboard | Active borrows, overdue count, pending fines |
| `/app/books` | Browse Books | Search by title/author, filter by genre/language/status |
| `/app/books/:id` | Book Detail | View copies, borrow a copy |
| `/app/borrows` | My Borrows | Paginated history, return action, status badges |
| `/app/fines` | My Fines | Pending / paid fines, pay action |
| `/app/payments` | My Payments | Payment history |
| `/app/profile` | My Profile | Edit details, change password |

### Staff Portal (`/staff`)
| Route | Page | Key Actions |
|---|---|---|
| `/staff` | Dashboard | Stats: total books, active borrows, overdue, pending fines |
| `/staff/books` | Books List | Full CRUD, search, filter |
| `/staff/books/:id` | Book Detail | Edit, view copies |
| `/staff/books/new` | Create Book | |
| `/staff/authors` | Authors List | Full CRUD |
| `/staff/genres` | Genres List | Full CRUD |
| `/staff/publishers` | Publishers List | Full CRUD |
| `/staff/book-copies` | Book Copies List | Full CRUD, barcode lookup |
| `/staff/users` | Users List | Search, filter by status, view, edit, deactivate |
| `/staff/users/:id` | User Detail | Borrow history, fine summary |
| `/staff/librarians` | Librarians List | ADMIN only — full CRUD |
| `/staff/borrowed` | Borrows List | All borrows, filter by status, mark return |
| `/staff/borrowed/overdue` | Overdue List | Quick return / assess fine actions |
| `/staff/fines` | Fines List | Create, assess, pay, waive |
| `/staff/payments` | Payments List | Filter by method/status |
| `/staff/profile` | Staff Profile | Edit details, change password |

---

## 5. Authentication Flow

1. User submits login form → POST `/api/auth/user/login` or `/api/auth/librarian/login` based on toggle.
2. On success: store JWT in `localStorage`; decode payload to extract `role`.
3. `AuthContext` exposes `{ user, role, isAuthenticated, login, logout }`.
4. Axios interceptor reads token from context / localStorage and sets `Authorization: Bearer {token}` header.
5. On 401 response: interceptor calls `logout()` and redirects to `/login`.
6. `ProtectedRoute` component checks `isAuthenticated` + `role` before rendering child routes.

---

## 6. Key Shared Components

| Component | Purpose |
|---|---|
| `DataTable` | Server-side paginated table wrapper around TanStack Table; accepts columns + query hook |
| `Pagination` | Page controls wired to TanStack Query `page` / `size` params |
| `ConfirmDialog` | Reusable destructive-action confirmation modal |
| `StatusBadge` | Colored badge for ACTIVE/INACTIVE/BORROWED/OVERDUE/PENDING/PAID etc. |
| `SearchInput` | Debounced search field (300 ms) |
| `FormField` | Wrapper combining label + input + error message |
| `PageShell` | Consistent page header (title + breadcrumbs + action button slot) |
| `Sidebar` | Role-aware navigation; collapses on mobile |

---

## 7. API Layer Design

`src/lib/axios.ts` — single Axios instance:
```ts
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(null, error => {
  if (error.response?.status === 401) { logout(); navigate('/login'); }
  return Promise.reject(error);
});
```

Each feature's `api.ts` exports TanStack Query hooks:
```ts
// features/books/api.ts
export const useBooks = (params) =>
  useQuery({ queryKey: ['books', params], queryFn: () => api.get('/api/books', { params }) });

export const useCreateBook = () =>
  useMutation({ mutationFn: (data) => api.post('/api/books', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }) });
```

---

## 8. Form Validation Strategy

Zod schemas mirror backend DTO constraints exactly, e.g.:

```ts
// features/books/schemas.ts
export const bookSchema = z.object({
  isbn:            z.string().min(1).max(20),
  title:           z.string().min(1).max(300),
  description:     z.string().max(2000).optional(),
  publicationDate: z.string().optional(),   // ISO date string
  language:        z.string().max(50).optional(),
  pageCount:       z.number().int().positive().optional(),
  publisherId:     z.number().int().positive(),
  authorIds:       z.array(z.number()).min(1),
  genreIds:        z.array(z.number()).min(1),
});
```

React Hook Form's `resolver` wires Zod schema to the form; errors display inline under each field.

---

## 9. Dashboard Widgets (Staff)

Data is assembled from existing endpoints — no new backend APIs required:

| Widget | Data Source |
|---|---|
| Total Books | GET `/api/books` (non-paginated count) |
| Available Copies | GET `/api/book-copies/status/AVAILABLE` |
| Active Borrows | GET `/api/borrowed/status/BORROWED` |
| Overdue Borrows | GET `/api/borrowed/overdue` |
| Pending Fines | GET `/api/fines/status/PENDING` |
| Total Users | GET `/api/users` |

Member dashboard uses the same endpoints filtered by `userId`.

---

## 10. Implementation Phases

### Phase 1 — Foundation (Days 1–2)
- [ ] Scaffold Vite + React + TypeScript + Tailwind + shadcn/ui
- [ ] Configure Axios instance and TanStack Query client
- [ ] Set up React Router with public / member / staff route trees
- [ ] Build `AuthContext`, login page, register page, JWT decode logic
- [ ] Build `Sidebar`, `Navbar`, `PageShell`, `ProtectedRoute`

### Phase 2 — Book Catalogue (Days 3–4)
- [ ] Books list with search, filter by status/genre, pagination
- [ ] Book detail page (authors, genres, publisher, available copies)
- [ ] Author, Genre, Publisher CRUD pages (staff)
- [ ] Book Copies CRUD + barcode lookup (staff)
- [ ] Book create / edit form with multi-select for authors and genres

### Phase 3 — Borrowing Flow (Days 5–6)
- [ ] Staff: All borrows list with status filter + return action
- [ ] Staff: Overdue list with bulk-return and fine assessment
- [ ] Member: My Borrows list with return button
- [ ] Member: Borrow book action from Book Detail page

### Phase 4 — Fines & Payments (Day 7)
- [ ] Staff: Fines list, create fine, assess overdue fine, pay / waive
- [ ] Member: My Fines list + pay action
- [ ] Staff + Member: Payments history

### Phase 5 — User & Staff Management (Day 8)
- [ ] Staff: Users list with search, status filter, deactivate
- [ ] Staff: User detail with embedded borrow + fine summary
- [ ] Admin: Librarians CRUD
- [ ] Profile pages for both portals (edit details, change password)

### Phase 6 — Polish (Day 9)
- [ ] Staff & Member dashboards with summary widgets
- [ ] Empty states, loading skeletons, error boundaries
- [ ] Mobile responsive layout (sidebar collapse, stacked tables)
- [ ] Accessibility audit (keyboard nav, ARIA labels, color contrast)

---

## 11. Environment & Deployment

```
# .env.local
VITE_API_BASE_URL=http://localhost:8080
```

Build output (`dist/`) is a static SPA — can be served from any CDN or static host (Vercel, Netlify, Nginx). CORS must be enabled on the Spring Boot backend for the frontend origin.

---

## 12. Key Design Decisions

- **No Redux** — TanStack Query handles all server state; React Context covers auth only.
- **Server-side pagination everywhere** — never fetch all records; always pass `page` + `size`.
- **Single login page, two portals** — a role toggle (Member / Staff) selects which login endpoint to call; the JWT role drives the post-login redirect.
- **Zod as single source of validation truth** — schemas live in each feature and are reused for both form validation and TypeScript type inference.
- **No mock data** — all development against the real Spring Boot backend (or a local Docker clone). TanStack Query's `staleTime` handles UX smoothness.
