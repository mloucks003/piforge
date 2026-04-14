# Requirements Document

## Introduction

PiForge Platform (Phase 2) extends the existing PiForge virtual Raspberry Pi laboratory with platform-level features: a polished landing page, user authentication via Supabase, cloud-based project storage, a project explorer dashboard, guided tutorial projects for beginners, and shareable project links. Phase 1 (the simulator itself) is already built and working with realistic Pi 4/Pi 5 board rendering, breadboard, LED/button components, wiring engine, Python execution via Pyodide, and LocalStorage save/load. The simulator currently lives at the root route (`/`) and must be relocated to `/lab`. Guest mode (no login required) remains fully functional with LocalStorage fallback. Logged-in users gain cloud persistence, multi-project management, and sharing capabilities.

## Glossary

- **PiForge**: The web application — a virtual Raspberry Pi laboratory.
- **Landing_Page**: The marketing/introduction page served at the root route (`/`) that explains PiForge and directs users to the lab.
- **Lab**: The simulator workspace (canvas, wiring, code editor, simulation) served at `/lab`. Previously the root route.
- **Auth_Service**: The Supabase Auth-based subsystem handling user registration, login, logout, and session management via Google and GitHub OAuth providers.
- **Session**: A persistent authentication context representing a logged-in user, stored as a Supabase session token in browser cookies.
- **Guest_Mode**: The default unauthenticated state where users access the Lab with full simulator functionality using LocalStorage for persistence.
- **Cloud_Storage**: The Supabase PostgreSQL-backed subsystem that stores project data for authenticated users.
- **Project**: A saved PiForge circuit configuration consisting of board model, component placements, wire connections, code, and metadata (name, description, thumbnail, timestamps).
- **Project_Explorer**: The dashboard page at `/projects` displaying all projects belonging to the authenticated user.
- **Tutorial**: A pre-built project with step-by-step instructional content that guides beginners through building a specific circuit and writing code.
- **Tutorial_Panel**: A side panel within the Lab that displays tutorial instructions, tracks step completion, and highlights relevant UI elements.
- **Share_Link**: A public URL that grants read-only access to a specific project. Anyone with the link can view the project and optionally fork it into their own account.
- **Fork**: The action of copying a shared project into the current user's account as a new independent project.
- **RLS**: Row Level Security — Supabase PostgreSQL policies that restrict data access to the owning user unless a project is explicitly shared.
- **Middleware**: Next.js middleware that intercepts requests to protected routes and enforces authentication requirements.
- **CTA**: Call-to-action — a prominent UI element (button or link) that directs users to perform a specific action.
- **Hero_Section**: The primary visual area at the top of the Landing_Page containing the headline, description, and CTA.

## Requirements

### Requirement 1: Route Restructuring

**User Story:** As a user, I want the simulator to live at `/lab` and a new landing page at `/`, so that PiForge has a proper entry point that explains the product before I dive into building.

#### Acceptance Criteria

1. WHEN a user navigates to `/`, THE Landing_Page SHALL be rendered as the root route.
2. WHEN a user navigates to `/lab`, THE Lab SHALL render the full simulator workspace (canvas, sidebar, editor, console, top bar) with identical functionality to the current root route implementation.
3. THE Lab SHALL retain all existing Phase 1 functionality (board rendering, breadboard, components, wiring, simulation, LocalStorage save/load) without regression after the route move.
4. WHEN a user navigates to the old root route (`/`) expecting the simulator, THE Landing_Page SHALL provide a visible "Launch Lab" CTA that navigates to `/lab`.

### Requirement 2: Landing Page

**User Story:** As a visitor, I want a polished, premium-feeling landing page that explains what PiForge does and shows me what it looks like, so that I understand the value and want to try it.

#### Acceptance Criteria

1. THE Landing_Page SHALL use a dark theme consistent with the application's existing dark-mode design system (Tailwind CSS, Geist font family).
2. THE Landing_Page SHALL display a Hero_Section containing: a headline describing PiForge, a subheadline summarizing key capabilities, and a prominent CTA button labeled "Launch Lab" or "Start Building" that navigates to `/lab`.
3. THE Hero_Section SHALL include an animated visual element (CSS or Framer Motion animation) that conveys the concept of circuit building or electronics prototyping.
4. THE Landing_Page SHALL display a feature highlights section with at least four feature cards, each containing an icon (lucide-react), a title, and a short description covering: board simulation, wiring engine, in-browser code execution, and component library.
5. THE Landing_Page SHALL display a visual showcase section containing at least one screenshot or embedded mini-demo of the simulator in action.
6. THE Landing_Page SHALL display a footer with project links (GitHub repository, license information).
7. THE Landing_Page SHALL render fully above the fold on a 1920×1080 viewport for the Hero_Section and CTA, with feature highlights and showcase accessible via scrolling.
8. WHEN the user is already authenticated, THE Landing_Page SHALL display a "Go to Projects" link in the navigation area in addition to the "Launch Lab" CTA.

### Requirement 3: Authentication

**User Story:** As a user, I want to create an account and log in using Google or GitHub, so that my projects are saved to my account and accessible from any device.

#### Acceptance Criteria

1. THE Auth_Service SHALL support user registration and login via Supabase Auth with Google OAuth provider.
2. THE Auth_Service SHALL support user registration and login via Supabase Auth with GitHub OAuth provider.
3. WHEN a user completes OAuth login, THE Auth_Service SHALL create a Session and redirect the user to `/projects`.
4. WHEN a user clicks "Log Out", THE Auth_Service SHALL destroy the Session and redirect the user to the Landing_Page.
5. THE Auth_Service SHALL persist the Session across browser refreshes using Supabase's built-in cookie/token management.
6. THE Lab SHALL remain fully functional in Guest_Mode without requiring authentication. Guest users SHALL use LocalStorage for project persistence.
7. WHEN an unauthenticated user navigates to `/projects`, THE Middleware SHALL redirect the user to a login page or modal.
8. WHEN an authenticated user navigates to `/lab`, THE Lab SHALL use Cloud_Storage for project persistence instead of LocalStorage.
9. IF the Auth_Service encounters an OAuth error during login, THEN THE Auth_Service SHALL display a descriptive error message to the user and allow retry.
10. THE Lab top bar SHALL display the user's avatar and name when authenticated, and a "Sign In" button when in Guest_Mode.

### Requirement 4: Cloud Project Storage

**User Story:** As a logged-in user, I want my projects saved to the cloud with metadata, so that I can access them from any device and manage multiple projects.

#### Acceptance Criteria

1. THE Cloud_Storage SHALL store each Project in a Supabase PostgreSQL table with columns: id (UUID primary key), user_id (foreign key to auth.users), name (text), description (text, nullable), thumbnail_url (text, nullable), circuit_data (JSONB containing the serialized Project_File), is_public (boolean, default false), share_id (UUID, nullable, unique), created_at (timestamptz), and updated_at (timestamptz).
2. THE Cloud_Storage SHALL enforce Row Level Security policies so that users can only read, create, update, and delete their own projects.
3. WHEN an authenticated user clicks Save in the Lab, THE Cloud_Storage SHALL upsert the current project state to the database, updating the circuit_data, updated_at timestamp, and optionally the name and description.
4. WHEN an authenticated user opens a project from the Project_Explorer, THE Cloud_Storage SHALL fetch the project's circuit_data and deserialize it into the Lab state.
5. THE Cloud_Storage SHALL support multiple projects per user with no hard-coded limit.
6. WHEN an authenticated user creates a new project, THE Cloud_Storage SHALL insert a new row with default name "Untitled Project" and empty circuit_data.
7. IF the Cloud_Storage encounters a network error during save, THEN THE Cloud_Storage SHALL fall back to LocalStorage, display a warning message, and retry the cloud save when connectivity is restored.
8. THE Cloud_Storage SHALL generate a canvas thumbnail (PNG data URL) on each save and store it in the thumbnail_url column for display in the Project_Explorer.

### Requirement 5: Project Explorer

**User Story:** As a logged-in user, I want a dashboard showing all my saved projects as visual cards, so that I can quickly find, open, rename, or delete projects.

#### Acceptance Criteria

1. WHEN an authenticated user navigates to `/projects`, THE Project_Explorer SHALL display all projects belonging to the user as a grid of cards.
2. THE Project_Explorer SHALL display each project card with: the project thumbnail (or a placeholder if none), the project name, and the last-edited date formatted as a relative time (e.g., "2 hours ago").
3. THE Project_Explorer SHALL display a "New Project" button that creates a new project via Cloud_Storage and navigates to `/lab` with the new project loaded.
4. WHEN the user clicks a project card, THE Project_Explorer SHALL navigate to `/lab?project={projectId}` and load the selected project.
5. WHEN the user activates the rename action on a project card, THE Project_Explorer SHALL display an inline text input allowing the user to edit the project name, and save the updated name to Cloud_Storage on confirmation.
6. WHEN the user activates the delete action on a project card, THE Project_Explorer SHALL display a confirmation dialog. Upon confirmation, THE Cloud_Storage SHALL delete the project permanently.
7. THE Project_Explorer SHALL display a search input that filters visible project cards by name in real time.
8. THE Project_Explorer SHALL sort projects by last-edited date in descending order by default.
9. WHEN the Project_Explorer has zero projects, THE Project_Explorer SHALL display an empty state with a message and a "Create Your First Project" CTA.

### Requirement 6: Guided Tutorial Projects

**User Story:** As a beginner, I want step-by-step tutorial projects that teach me how to use PiForge and learn electronics basics, so that I can get started without prior knowledge.

#### Acceptance Criteria

1. THE Lab SHALL include a tutorial system with at least four pre-built tutorials: "Blink an LED", "Button + LED", "Traffic Light", and "Sensor Dashboard".
2. WHEN the user starts a tutorial, THE Lab SHALL load the tutorial's initial circuit state (board, components, wires as defined by the tutorial) and open the Tutorial_Panel.
3. THE Tutorial_Panel SHALL display the current step's instructions as formatted text (Markdown or rich text) in a side panel within the Lab.
4. THE Tutorial_Panel SHALL display a step progress indicator showing the current step number, total steps, and completion status for each step.
5. WHEN the user completes the actions described in a tutorial step (e.g., places a component, creates a wire, runs code), THE Tutorial_Panel SHALL detect the completion condition and advance to the next step.
6. WHEN the user reaches the final step of a tutorial, THE Tutorial_Panel SHALL display a completion message with an option to continue experimenting or return to the tutorial list.
7. THE "Blink an LED" tutorial SHALL include steps for: selecting a board, adding a breadboard, placing an LED, wiring the LED to GPIO 17 and ground, loading the blink template code, and running the simulation.
8. THE "Button + LED" tutorial SHALL include steps for: placing a button and LED, wiring both to the board, writing code that reads button input and controls the LED, and running the simulation.
9. THE "Traffic Light" tutorial SHALL include steps for: placing three LEDs (red, yellow/green, green), wiring all three to GPIO pins, writing a timed sequence program, and running the simulation.
10. THE "Sensor Dashboard" tutorial SHALL include steps for: placing a DHT22 sensor, wiring the sensor to the board, writing code that reads temperature and humidity values, and displaying the readings in the console.
11. THE Landing_Page SHALL display a tutorials section or link that directs users to the tutorial list.
12. WHEN a tutorial is started, THE Lab SHALL operate in a sandboxed mode where the tutorial circuit state does not overwrite the user's existing project.

### Requirement 7: Shareable Project Links

**User Story:** As a logged-in user, I want to generate a public link for my project so that anyone can view my circuit and optionally fork it into their own account.

#### Acceptance Criteria

1. WHEN an authenticated user activates the "Share" action on a project, THE Cloud_Storage SHALL generate a unique share_id (UUID) for the project and set is_public to true.
2. THE Share_Link SHALL follow the format `/share/{share_id}` and be copyable to the clipboard.
3. WHEN any user (authenticated or guest) navigates to a Share_Link, THE Lab SHALL load the shared project in read-only mode with all simulation functionality available (view circuit, run code) but editing disabled (no adding/removing components, no modifying wires, no changing code).
4. WHEN an authenticated user views a shared project, THE Lab SHALL display a "Fork" button that copies the project into the user's account as a new independent project.
5. WHEN a guest user views a shared project, THE Lab SHALL display a "Sign in to Fork" prompt instead of the Fork button.
6. THE Cloud_Storage RLS policy SHALL allow any user to read projects where is_public is true, while restricting write access to the project owner.
7. WHEN the project owner deactivates sharing, THE Cloud_Storage SHALL set is_public to false and clear the share_id. Subsequent visits to the old Share_Link SHALL display a "Project not found or no longer shared" message.
8. IF a user navigates to a Share_Link with an invalid or expired share_id, THEN THE Lab SHALL display a "Project not found" message with a link back to the Landing_Page.
