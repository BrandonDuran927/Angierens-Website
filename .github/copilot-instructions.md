# Angierens Website - AI Copilot Instructions

## Project Overview
Angierens is a full-stack food delivery web application built with **React + TanStack Router** (frontend) and **Express.js** (backend), using **Supabase** for authentication and data persistence. The app supports multiple user roles (customer, staff, chef, admin) with distinct interfaces.

## Architecture

### Frontend Stack
- **Framework**: React 19 with TanStack Router v1 (file-based routing)
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **State Management**: React Context (`UserContext`) + TanStack Query (React Query)
- **External APIs**: Google Maps API (directions/geocoding), Supabase Auth
- **Build Tool**: Vite 6 with auto code-splitting via TanStack Router plugin

### Backend Stack
- **Server**: Express.js (Node.js)
- **API Layer**: RESTful endpoints in `backend/src/index.ts`
- **Key Integration**: Google Maps Directions & Geocoding APIs (proxied)
- **Port**: 3001 (dev: `npm run dev`, configured for CORS with http://localhost:3000 and 5173)

### Data Layer
- **Auth**: Supabase Auth (email-based with session persistence)
- **Database**: Supabase PostgreSQL
- **Key Tables**: `users`, `orders`, `menu_items`, `addresses`, `cart_items`, `payments`, `deliveries`

## Critical Developer Workflows

### Getting Started
```bash
cd Angierens-Website
npm install
npm run dev        # Frontend on :3000
cd backend && npm run dev  # Backend on :3001 (separate terminal)
```

### Build & Deploy
```bash
npm run build      # Compiles frontend + runs TypeScript check
npm run serve      # Preview production build locally
```

### Code Quality
```bash
npm run lint       # Check with ESLint (TanStack config)
npm run format     # Format with Prettier
npm run check      # Fix + format both
npm run test       # Run Vitest (jsdom environment)
```

### Environment Setup
Create `.env.local` with:
```
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_anon_key>
```

Backend needs `.env`:
```
GOOGLE_MAPS_API_KEY=<your_api_key>
PORT=3001
```

## Routing Conventions

### File-Based Routing Pattern
Routes in `src/routes/` auto-generate to `routeTree.gen.ts`:
- **Lazy routes**: `*.lazy.tsx` - code-split by route
- **Layout routes**: Nested directories with `layout/*.lazy.tsx` wrappers
- **Dynamic routes**: `$paramName.lazy.tsx` creates URL parameters

### Role-Based Interface Structure
```
customer-interface/     # Main shopping interface
  cart.lazy.tsx
  order.lazy.tsx
  payment.tsx
  feedback/
    index.lazy.tsx
    $feedbackId.lazy.tsx
admin-interface/        # Dashboard, reporting, menu management
  index.lazy.tsx
  menu.lazy.tsx
  orders.lazy.tsx
  employee/
    index.lazy.tsx
staff/                  # Delivery tracking
chef-interface/         # Order preparation
```

### Route Protection Pattern
```tsx
// Wrap route components with ProtectedRoute
import { ProtectedRoute } from '@/components/ProtectedRoute'

function RouteComponent() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      {/* Admin/staff only content */}
    </ProtectedRoute>
  )
}
```

## Core Patterns

### User Context & Auth
- **Location**: [src/context/UserContext.tsx](src/context/UserContext.tsx)
- Provides: `user` (Supabase User), `userRole` (from users table), `loading`, `setUser()`, `signOut()`
- Role fetched from `users.user_role` on auth state change
- **Important**: Role state is async; ProtectedRoute checks `loading` first

### API Patterns
- **Location**: [src/lib/api.ts](src/lib/api.ts)
- Defines TypeScript interfaces for all domain models (Order, User, Schedule, etc.)
- Direct Supabase queries: `.from('table').select().eq().single()`
- **Note**: No centralized error handling; callers must handle Supabase errors

### Supabase Client Setup
- **Location**: [src/lib/supabaseClient.ts](src/lib/supabaseClient.ts)
- Auto-refresh token enabled, session persists via localStorage
- Session detection happens in UserContext on mount

### Backend Google Maps Proxy
- **GET `/api/directions`**: origin + destination → Google Directions API
- **GET `/api/geocode`**: address → coordinates (implementation in index.ts lines 80+)
- **CORS**: Allows :3000 and :5173 (Vite dev)

## State Management Patterns

### React Query Configuration
- Stale time: 5 minutes
- Refetch on window focus: disabled
- Structural sharing: enabled (deep equal comparison)
- **Usage**: `useQuery()` for fetch, custom mutations for updates

### Component State Conventions
- Form state (cart items, filters): local `useState()`
- Notifications: local state with UI-driven dismissal (no persistence)
- Multi-tab interfaces: location state via `useLocation()` to track active tab

## Styling & UI Components

### Tailwind + Lucide Integration
- Icons from `lucide-react`: Menu, ShoppingCart, Plus, Minus, Bell, Heart, Star, etc.
- Responsive patterns: `md:`, `lg:` breakpoints common
- Common classes: `min-h-screen`, `bg-center`, `flex flex-col`, `gap-4`

### Existing Component Library
- **Header.tsx**: Global navigation header (in `src/components/`)
- **DirectionsModal.tsx**: Google Maps directions display
- **ProtectedRoute.tsx**: Auth-gated component wrapper

## Known Issues & TODOs
- [src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx#L15-L17): userRole sometimes null on first load; timing issue between auth and role fetch
- Notification system in cart interface not persisted; reload loses state

## External Dependencies
- **Google Maps API**: Requires API key, used for directions & geocoding
- **Supabase**: Auth + DB; ensure tables exist (`users`, `orders`, `menu_items`, etc.)
- **Leaflet**: Maps display (CSS imported in main.tsx)

## Code Quality Standards
- **Linting**: ESLint with TanStack config (no custom rules beyond defaults)
- **Formatting**: Prettier (2-space indent, single quotes)
- **TypeScript**: Strict mode enabled; interfaces defined in api.ts for domain objects
- **Testing**: Vitest with jsdom; no tests currently written (scaffold in `__tests__/` if added)

## Common Development Tasks

### Adding a New Route
1. Create `src/routes/my-route.lazy.tsx` using `createLazyFileRoute()`
2. Export `Route` and `RouteComponent`
3. routeTree.gen.ts auto-updates on dev reload
4. Wrap in `<ProtectedRoute>` if auth-gated

### Adding a Menu Item to Admin Dashboard
- Fetch data via `useQuery()` + api.ts function
- Render with Recharts (BarChart, LineChart) for analytics
- Update navigation link in Header or sidebar

### Calling Backend API
```tsx
const response = await fetch(
  `http://localhost:3001/api/directions?origin=${origin}&destination=${dest}`
)
const data = await response.json()
```

## File Organization
- `src/`: Frontend React app
  - `components/`: Shared components (auth, protected routes, headers)
  - `context/`: UserContext provider
  - `routes/`: File-based router (auto-generated routeTree)
  - `lib/`: API client, Supabase client, utilities
  - `utils/`: Helpers (loadGoogleMaps.ts)
- `backend/`: Express server
  - `src/index.ts`: Main server + route handlers
- `public/`: Static assets (manifest.json, images)
