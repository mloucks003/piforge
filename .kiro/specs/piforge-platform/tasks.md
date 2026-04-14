# Implementation Plan: PiForge Platform

## Overview

Transform PiForge from a single-page simulator into a multi-page platform with landing page, authentication, cloud storage, project management, tutorials, and sharing. Tasks are ordered for fastest incremental value: route restructure first, then landing page, auth, storage, explorer, tutorials, and sharing.

## Tasks

- [x] 1. Route restructure — move simulator to `/lab`
  - [x] 1.1 Create `app/lab/page.tsx` with the current simulator layout
    - Move the existing `Home` component content (AutoLoader, TopBar, Sidebar, CanvasArea, Console, RightPanel) into a new `app/lab/page.tsx`
    - The Lab page must render identically to the current root page
    - _Requirements: 1.2, 1.3_

  - [x] 1.2 Convert `app/page.tsx` to a placeholder landing page
    - Replace the current simulator content with a minimal dark-themed page containing a "Launch Lab" link to `/lab`
    - This is temporary — the full landing page comes in task 2
    - _Requirements: 1.1, 1.4_

  - [x] 1.3 Verify Lab retains all Phase 1 functionality
    - Ensure all imports resolve correctly in the new `/lab` route
    - Confirm LocalStorage save/load, board rendering, wiring, simulation, and code execution work at `/lab`
    - _Requirements: 1.3_

- [x] 2. Checkpoint — Route restructure complete
  - Ensure the app builds without errors, the simulator works at `/lab`, and `/` shows the placeholder landing page. Ask the user if questions arise.

- [ ] 3. Landing page
  - [ ] 3.1 Install `framer-motion` and create landing page component structure
    - Add `framer-motion` to dependencies
    - Create `components/landing/HeroSection.tsx`, `components/landing/FeatureCards.tsx`, `components/landing/ShowcaseSection.tsx`, `components/landing/Footer.tsx`, and `components/landing/LandingNav.tsx`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 3.2 Implement `LandingNav` component
    - Dark-themed top nav with PiForge logo/text on the left
    - "Launch Lab" link on the right navigating to `/lab`
    - Placeholder slot for auth-aware "Sign In" / "Go to Projects" (wired later in task 5)
    - _Requirements: 2.8_

  - [ ] 3.3 Implement `HeroSection` with animated visual
    - Headline describing PiForge, subheadline summarizing capabilities
    - Prominent CTA button ("Launch Lab" or "Start Building") linking to `/lab`
    - Animated circuit-trace SVG visual using `framer-motion` (path drawing effect)
    - Must render fully above the fold on 1920×1080
    - _Requirements: 2.2, 2.3, 2.7_

  - [ ] 3.4 Implement `FeatureCards` section
    - Grid of at least 4 cards: Board Simulation, Wiring Engine, In-Browser Code Execution, Component Library
    - Each card has a `lucide-react` icon, title, and short description
    - _Requirements: 2.4_

  - [ ]* 3.5 Write property test for feature card completeness
    - **Property 8: Feature Card Completeness**
    - Generate random feature card data. Assert each card renders icon, title, description, and section has ≥ 4 cards.
    - **Validates: Requirements 2.4**

  - [ ] 3.6 Implement `ShowcaseSection` and `Footer`
    - Showcase: at least one screenshot or embedded visual of the simulator
    - Footer: GitHub repo link, license info
    - _Requirements: 2.5, 2.6_

  - [ ] 3.7 Assemble landing page in `app/page.tsx`
    - Compose LandingNav, HeroSection, FeatureCards, ShowcaseSection, Footer into the root page
    - Dark theme consistent with existing Tailwind/Geist design system
    - _Requirements: 2.1, 2.7_

- [ ] 4. Checkpoint — Landing page complete
  - Ensure the landing page renders correctly at `/`, all sections are visible, CTA links to `/lab`, and the app builds. Ask the user if questions arise.

- [ ] 5. Supabase setup and authentication
  - [ ] 5.1 Install Supabase dependencies and create client utilities
    - Add `@supabase/supabase-js` and `@supabase/ssr` to dependencies
    - Create `lib/supabase/client.ts` (browser client via `createBrowserClient`)
    - Create `lib/supabase/server.ts` (server client via `createServerClient` with cookie handling)
    - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local.example`
    - _Requirements: 3.1, 3.2, 3.5_

  - [ ] 5.2 Create `AuthProvider` context component
    - Create `components/providers/AuthProvider.tsx` implementing `AuthContextValue` interface from design
    - Initialize session via `supabase.auth.getSession()` on mount
    - Subscribe to `onAuthStateChange` for real-time session updates
    - Expose `signInWithOAuth` (Google/GitHub) and `signOut` methods
    - Wrap app in `AuthProvider` in `app/layout.tsx`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.10_

  - [ ] 5.3 Create OAuth callback route handler
    - Create `app/auth/callback/route.ts` as a GET route handler
    - Extract `code` from search params, exchange for session via server Supabase client
    - Redirect to `/projects` on success, `/?error=auth_failed` on failure
    - _Requirements: 3.3, 3.9_

  - [ ] 5.4 Create Next.js middleware for route protection
    - Create `middleware.ts` at project root
    - Protect `/projects` route — redirect unauthenticated users to `/`
    - Refresh session on every request to keep cookies alive
    - Pass through all other routes (`/`, `/lab`, `/share/*`)
    - _Requirements: 3.7_

  - [ ] 5.5 Update `TopBar` with auth-aware UI
    - Show user avatar + name dropdown when authenticated
    - Show "Sign In" button when in Guest_Mode
    - Make "PiForge" logo link to `/`
    - _Requirements: 3.10_

  - [ ] 5.6 Update `LandingNav` with auth-aware links
    - When authenticated: show "Go to Projects" link alongside "Launch Lab"
    - When guest: show "Sign In" button
    - _Requirements: 2.8_

- [ ] 6. Checkpoint — Authentication complete
  - Ensure OAuth login/logout works with Google and GitHub, session persists across refresh, `/projects` redirects unauthenticated users, TopBar and LandingNav reflect auth state. Ask the user if questions arise.

- [ ] 7. Cloud storage and ProjectService
  - [ ] 7.1 Create Supabase database migration SQL
    - Write the `projects` table schema (id, user_id, name, description, thumbnail_url, circuit_data JSONB, is_public, share_id, created_at, updated_at)
    - Include indexes, RLS policies, and `updated_at` trigger as specified in design
    - Output as a `.sql` file in `lib/supabase/migrations/` for manual execution
    - _Requirements: 4.1, 4.2_

  - [ ] 7.2 Implement `ProjectService` interface and types
    - Create `lib/projects/types.ts` with `ProjectService`, `ProjectSummary`, and `ProjectRecord` interfaces from design
    - _Requirements: 4.1_

  - [ ] 7.3 Implement `SupabaseProjectService`
    - Create `lib/projects/supabase-service.ts` implementing `ProjectService`
    - Implement `list`, `get`, `create`, `save`, `rename`, `delete` methods using Supabase client
    - Implement `share`, `unshare`, `getShared`, `fork` methods
    - Handle network errors with LocalStorage fallback and retry queue
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ] 7.4 Implement `LocalProjectService`
    - Create `lib/projects/local-service.ts` implementing `ProjectService` for guest mode
    - Wrap existing `saveToLocalStorage`/`loadFromLocalStorage` logic
    - _Requirements: 3.6_

  - [ ] 7.5 Create `ProjectServiceProvider` and factory
    - Create `lib/projects/provider.ts` that returns `SupabaseProjectService` when authenticated, `LocalProjectService` when guest
    - Integrate with `AuthProvider` context
    - _Requirements: 3.6, 3.8_

  - [ ] 7.6 Implement thumbnail generation on save
    - Use Konva stage `toDataURL()` to generate PNG data URL
    - Pass thumbnail to `ProjectService.save()` for storage in `thumbnail_url` column
    - _Requirements: 4.8_

  - [ ] 7.7 Wire Lab to use ProjectService for save/load
    - Update Lab page to accept `?project={id}` query param
    - Load project from `ProjectService.get(id)` when param present
    - Save via `ProjectService.save()` instead of direct LocalStorage when authenticated
    - _Requirements: 3.8, 4.3, 4.4_

  - [ ]* 7.8 Write property test for project save/load round trip
    - **Property 1: Project Save/Load Round Trip**
    - Generate random `ProjectFile` objects. Save then load via `ProjectService`. Assert deep equality of `circuit_data`.
    - **Validates: Requirements 4.3, 4.4**

  - [ ]* 7.9 Write property test for project count integrity
    - **Property 3: Project Count Integrity**
    - Create N projects via `ProjectService.create()`. Call `list()`. Assert count = N and all IDs unique.
    - **Validates: Requirements 4.5, 5.1**

- [ ] 8. Checkpoint — Cloud storage complete
  - Ensure authenticated users can create, save, load, rename, and delete projects in the cloud. Guest mode still works with LocalStorage. Ask the user if questions arise.

- [ ] 9. Project Explorer
  - [ ] 9.1 Create Project Explorer page at `/projects`
    - Create `app/projects/page.tsx` as a server component that fetches project list via Supabase server client
    - Render `ProjectGrid` client component
    - _Requirements: 5.1_

  - [ ] 9.2 Implement `ProjectGrid` and `ProjectCard` components
    - Create `components/projects/ProjectGrid.tsx` with card grid layout
    - Create `components/projects/ProjectCard.tsx` displaying thumbnail (or placeholder), name, relative time
    - "New Project" button that creates project and navigates to `/lab?project={id}`
    - Empty state with "Create Your First Project" CTA when no projects exist
    - _Requirements: 5.1, 5.2, 5.3, 5.9_

  - [ ] 9.3 Implement project card actions (rename, delete, open)
    - Click card → navigate to `/lab?project={id}`
    - Inline rename with text input, saves to `ProjectService.rename()`
    - Delete with confirmation dialog, calls `ProjectService.delete()`
    - _Requirements: 5.4, 5.5, 5.6_

  - [ ] 9.4 Implement search and sort
    - Search input that filters cards by name (case-insensitive substring match, client-side)
    - Default sort by `updatedAt` descending
    - _Requirements: 5.7, 5.8_

  - [ ]* 9.5 Write property test for search filter correctness
    - **Property 4: Project Search Filter Correctness**
    - Generate random project names and search queries. Assert filtered results match case-insensitive substring inclusion exactly.
    - **Validates: Requirements 5.7**

  - [ ]* 9.6 Write property test for project sort order
    - **Property 5: Project Sort Order**
    - Generate random projects with distinct timestamps. Assert descending order by `updatedAt`.
    - **Validates: Requirements 5.8**

  - [ ]* 9.7 Write property test for project card navigation URL
    - **Property 6: Project Card Navigation URL**
    - Generate random project IDs. Assert navigation URL matches `/lab?project={id}`.
    - **Validates: Requirements 5.4**

  - [ ]* 9.8 Write property test for project card required fields
    - **Property 7: Project Card Required Fields**
    - Generate random project data. Render card. Assert name, thumbnail/placeholder, and relative time are present.
    - **Validates: Requirements 5.2**

- [ ] 10. Checkpoint — Project Explorer complete
  - Ensure the project explorer displays cards, search/sort work, CRUD actions function, and navigation to Lab loads the correct project. Ask the user if questions arise.

- [x] 11. Guided tutorials
  - [x] 11.1 Create tutorial type definitions and engine
    - Create `lib/tutorials/types.ts` with `TutorialDefinition`, `TutorialStep`, and `CompletionCondition` types from design
    - Create `lib/tutorials/engine.ts` implementing `TutorialEngine` class with Zustand store subscription, step tracking, and completion detection
    - _Requirements: 6.2, 6.5_

  - [x] 11.2 Create tutorial definitions
    - Create `lib/tutorials/definitions/blink-led.ts` — "Blink an LED" tutorial with steps for board selection, breadboard, LED placement, wiring to GPIO 17 + ground, blink code, simulation
    - Create `lib/tutorials/definitions/button-led.ts` — "Button + LED" tutorial
    - Create `lib/tutorials/definitions/traffic-light.ts` — "Traffic Light" tutorial with 3 LEDs and timed sequence
    - Create `lib/tutorials/definitions/sensor-dashboard.ts` — "Sensor Dashboard" tutorial with DHT22
    - Create `lib/tutorials/index.ts` exporting all tutorial definitions
    - _Requirements: 6.1, 6.7, 6.8, 6.9, 6.10_

  - [x] 11.3 Implement `TutorialPanel` UI component
    - Create `components/tutorials/TutorialPanel.tsx` as a side panel in the Lab
    - Display current step instructions (Markdown rendered)
    - Step progress indicator (current step / total, completion checkmarks)
    - "Skip Step" button, hints display after 60s timeout
    - Completion message at final step with "Continue Experimenting" and "Back to Tutorials" options
    - _Requirements: 6.3, 6.4, 6.6_

  - [x] 11.4 Implement tutorial sandbox mode
    - On tutorial start: snapshot current project state to a temporary slot, load tutorial `initialState`
    - On tutorial end: restore the original project state
    - _Requirements: 6.12_

  - [x] 11.5 Wire tutorial mode into Lab
    - Support `/lab?tutorial={id}` query param to auto-start a tutorial
    - Integrate `TutorialPanel` into Lab layout (conditionally rendered when tutorial active)
    - Add tutorial list/launcher accessible from Lab or Landing Page
    - _Requirements: 6.2, 6.11_

  - [ ]* 11.6 Write property test for tutorial initial state loading
    - **Property 9: Tutorial Initial State Loading**
    - Generate random tutorial definitions with random `initialState`. Start tutorial. Assert store matches `initialState`.
    - **Validates: Requirements 6.2**

  - [ ]* 11.7 Write property test for tutorial panel state correctness
    - **Property 10: Tutorial Panel State Correctness**
    - Generate random tutorial with N steps. For each step index i, assert panel shows correct content and progress.
    - **Validates: Requirements 6.3, 6.4**

  - [ ]* 11.8 Write property test for tutorial completion detection
    - **Property 11: Tutorial Completion Detection**
    - Generate random completion conditions and matching store states. Assert engine detects completion and advances.
    - **Validates: Requirements 6.5**

  - [ ]* 11.9 Write property test for tutorial sandbox round trip
    - **Property 12: Tutorial Sandbox Round Trip**
    - Generate random project state. Start tutorial. Stop tutorial. Assert original state restored.
    - **Validates: Requirements 6.12**

- [ ] 12. Checkpoint — Tutorials complete
  - Ensure all 4 tutorials load, steps advance on completion, sandbox mode preserves user state, and the tutorial panel renders correctly. Ask the user if questions arise.

- [ ] 13. Shareable project links
  - [ ] 13.1 Implement share/unshare in ProjectService
    - Wire `ProjectService.share()` to generate UUID `share_id`, set `is_public = true`
    - Wire `ProjectService.unshare()` to clear `share_id` and set `is_public = false`
    - Wire `ProjectService.getShared()` to fetch by `share_id` where `is_public = true`
    - _Requirements: 7.1, 7.7_

  - [ ] 13.2 Create shared project view at `/share/[id]`
    - Create `app/share/[id]/page.tsx` as a server component
    - Fetch project by `share_id` where `is_public = true`
    - If not found: render "Project not found or no longer shared" with link to home
    - If found: render Lab with `readOnly=true` and circuit data pre-loaded
    - _Requirements: 7.3, 7.8_

  - [ ] 13.3 Implement read-only mode in Lab
    - Accept `readOnly` prop to disable: component drag handlers, wire creation, Monaco editor editing
    - Keep simulation controls (play/pause/reset) functional
    - Show "Fork" button for authenticated users, "Sign in to Fork" for guests
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ] 13.4 Implement fork functionality
    - "Fork" button calls `ProjectService.fork(shareId)` to copy project into user's account
    - Navigate to `/lab?project={newId}` after fork
    - _Requirements: 7.4_

  - [ ] 13.5 Add share UI to TopBar and Project Explorer
    - Share toggle button in TopBar when viewing own cloud project
    - Copy share link to clipboard on activation
    - Share toggle on project cards in Project Explorer
    - _Requirements: 7.1, 7.2_

  - [ ]* 13.6 Write property test for share link generation
    - **Property 13: Share Link Generation**
    - Generate random project IDs. Share. Assert `share_id` is valid UUID, `is_public` is true, URL matches `/share/{share_id}`.
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 13.7 Write property test for shared project read-only mode
    - **Property 14: Shared Project Read-Only Mode**
    - Generate random shared projects. Load in share mode. Assert editor readOnly, drag disabled, simulation controls enabled.
    - **Validates: Requirements 7.3**

  - [ ]* 13.8 Write property test for unshare revokes access
    - **Property 15: Unshare Revokes Access**
    - Generate random shared projects. Unshare. Assert `is_public` false, `share_id` null, `getShared` returns null.
    - **Validates: Requirements 7.7**

- [ ] 14. Final checkpoint — All features complete
  - Ensure all tests pass, the full flow works end-to-end (landing → auth → projects → lab → share), and guest mode remains fully functional. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major milestone
- Property tests validate universal correctness properties from the design document
- The design document's Properties 2 (RLS Access Control) is validated at the database level via SQL policies and is not included as a code-level property test task
