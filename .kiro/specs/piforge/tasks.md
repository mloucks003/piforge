# Implementation Plan: PiForge — Virtual Raspberry Pi Laboratory

## Overview

Client-side, MIT-licensed virtual Raspberry Pi lab built with Next.js 15, React 19, TypeScript, react-konva, Pyodide, and Zustand. This plan covers Phase 1 scope only: 2D canvas, Pi 4/Pi 5 board rendering, breadboard + draggable components, wiring engine, and minimal GPIO mock + Pyodide integration. All property-based tests use fast-check with Vitest.

## Tasks

- [x] 1. Project structure and basic layout
  - [x] 1.1 Scaffold Next.js 15 app with React 19, TypeScript, Tailwind CSS, shadcn/ui, and install core dependencies (react-konva, konva, zustand, zod, lucide-react, @monaco-editor/react, fast-check, vitest)
    - Initialize with `create-next-app` using app router
    - Configure `tsconfig.json`, `tailwind.config.ts`, and dark-mode CSS variables
    - Create folder structure: `/app`, `/components`, `/lib/boards`, `/lib/components`, `/lib/wiring`, `/lib/simulation`, `/lib/serialization`, `/stores`, `/__tests__/unit`, `/__tests__/properties`
    - Add MIT LICENSE file
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [x] 1.2 Implement the main application layout shell with top bar, left palette sidebar, central canvas area, right editor panel, and bottom console
    - Create `components/layout/TopBar.tsx` with placeholder board switcher (Pi 4 / Pi 5 toggle), Play/Pause/Reset buttons, Save/Share buttons, Export menu, and PiForge branding using lucide-react icons
    - Create `components/layout/Sidebar.tsx` with placeholder component palette (searchable, categorized list)
    - Create `components/layout/CanvasArea.tsx` wrapping a react-konva `<Stage>` with pan (drag) and zoom (scroll wheel) support
    - Create `components/layout/RightPanel.tsx` with placeholder Monaco editor and properties inspector tabs
    - Create `components/layout/Console.tsx` with a scrollable output area for stdout/stderr/system messages
    - Wire all panels into `app/page.tsx` using a CSS grid/flex layout, dark-mode by default
    - Ensure responsive resize behavior with minimum viewport width of 1024px
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 1.3 Create the Zustand project store with core state shape
    - Implement `stores/projectStore.ts` with `ProjectState` interface: boardModel, components, breadboards, wires, pinStates, code, language, simulationState, consoleOutput, viewport
    - Implement actions: `addComponent`, `removeComponent`, `addWire`, `removeWire`, `setPinState`, `setCode`, `setBoardModel`
    - Implement `stores/canvasStore.ts` with viewport state (x, y, scale), selectedIds, snapToGrid, gridSize
    - _Requirements: 15.4, 2.1_

  - **Key files**: `app/page.tsx`, `components/layout/*`, `stores/projectStore.ts`, `stores/canvasStore.ts`, `tailwind.config.ts`, `package.json`
  - **Test plan**: Manually verify layout renders with all five panels visible, dark mode active, pan/zoom works on the Konva stage, and the Zustand store initializes correctly.

- [x] 2. Pi 4 and Pi 5 2D board renderer
  - [x] 2.1 Define board data models and static JSON definitions for Pi 4 and Pi 5
    - Create `lib/boards/types.ts` with `BoardModel`, `PinDefinition`, `PortDefinition` interfaces
    - Create `lib/boards/pi4.json` with all 40 GPIO pins (correct BCM numbers, labels, types, alt functions, positions), all ports (4× USB-A, USB-C power, 2× micro-HDMI, Ethernet, CSI, DSI, 3.5mm audio), mounting holes, and dimensions (85.6 × 56.5 mm)
    - Create `lib/boards/pi5.json` with all 40 GPIO pins (identical header to Pi 4), all ports (2× USB-3, 2× USB-2, USB-C power, 2× micro-HDMI, Ethernet, CSI, DSI, PCIe, power button), mounting holes, and dimensions (~85 × 57 mm)
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x]* 2.2 Write property test: Board Dimension Proportionality (Property 1)
    - **Property 1: Board Dimension Proportionality** — For any board model, rendered width/height ratio equals physical dimension ratio within 1% tolerance
    - **Validates: Requirements 1.3**

  - [x]* 2.3 Write property test: GPIO Header Identity Across Models (Property 2)
    - **Property 2: GPIO Header Identity Across Models** — For any two board models, the 40-pin GPIO header definitions (pin numbers, GPIO numbers, labels, types, positions) are identical
    - **Validates: Requirements 1.4**

  - [x] 2.4 Implement the Board Renderer component
    - Create `components/canvas/BoardRenderer.tsx` that reads the active board model from the Zustand store and renders the 2D SVG-based board on the Konva canvas
    - Render GPIO header with labeled pins (physical pin numbers and BCM labels), color-coded by type (power=red, ground=black, GPIO=blue, I2C/SPI=green)
    - Render all ports and connectors with proportional placement per official mechanical drawings
    - Render mounting holes at correct positions
    - Default to 2D schematic view (Requirement 1.6)
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [x] 2.5 Implement board model switcher in the top bar
    - Wire the Pi 4 / Pi 5 toggle in `TopBar.tsx` to `setBoardModel` action in the Zustand store
    - Board switch must re-render within 200ms (Requirement 1.4)
    - _Requirements: 1.4_

  - **Key files**: `lib/boards/types.ts`, `lib/boards/pi4.json`, `lib/boards/pi5.json`, `components/canvas/BoardRenderer.tsx`, `components/layout/TopBar.tsx`
  - **Test plan**: Verify both board models render with correct pin labels, port placement, and proportional dimensions. Toggle between Pi 4 and Pi 5 and confirm switch is fast. Run property tests for Properties 1 and 2.

- [x] 3. Checkpoint — Board rendering
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Breadboard and draggable components (LED + button) with snap-to-grid
  - [x] 4.1 Implement the Breadboard Renderer
    - Create `components/canvas/BreadboardRenderer.tsx` rendering an 830-point breadboard on the Konva canvas
    - Render labeled power rails (positive/negative, top and bottom)
    - Render internal bus connections: rows a–e share a bus, rows f–j share a bus, with a center gap
    - Render row/column labels for easy identification
    - Support placing multiple independent breadboards on the canvas
    - _Requirements: 2.2, 2.3_

  - [x]* 4.2 Write property test: Breadboard Bus Topology Correctness (Property 3)
    - **Property 3: Breadboard Bus Topology Correctness** — For any two points in the same row within the same bus group (a–e or f–j), they are electrically connected. Points in different bus groups of the same row are NOT connected unless explicitly wired.
    - **Validates: Requirements 2.2**

  - [x]* 4.3 Write property test: Multiple Breadboard Independence (Property 4)
    - **Property 4: Multiple Breadboard Independence** — For any N breadboards added, the state contains exactly N entries with independent positions; modifying one does not affect others.
    - **Validates: Requirements 2.3**

  - [x] 4.4 Implement snap-to-grid logic for component placement
    - Create `lib/canvas/snap.ts` with `snapToPosition(dragPos, breadboards, gridSize, tolerance)` function
    - If a valid breadboard row is within snap tolerance, snap to it; otherwise snap to nearest grid-aligned position
    - Default grid size: 10px, snap tolerance: 10px
    - _Requirements: 2.4_

  - [x]* 4.5 Write property test: Component Snap-to-Grid (Property 5)
    - **Property 5: Component Snap-to-Grid** — For any drag position and breadboard set, the snap function returns the nearest valid breadboard row or grid-aligned position, never farther than snap tolerance from a valid target.
    - **Validates: Requirements 2.4**

  - [x] 4.6 Define component JSON schema and create LED + Button component definitions
    - Create `lib/components/types.ts` with `ComponentDefinition`, `ComponentPinDef`, `SimulationBehavior` interfaces
    - Create `lib/components/schema.ts` with Zod schema for component validation
    - Create `lib/components/definitions/led-red.json` (anode + cathode pins, on/off visual states)
    - Create `lib/components/definitions/button.json` (pin 1, pin 2, pressed/released states)
    - _Requirements: 3.1, 3.2_

  - [x]* 4.7 Write property test: Component Schema Validation (Property 6)
    - **Property 6: Component Schema Validation** — For any JSON object, if it conforms to the ComponentDefinition schema, the library accepts it; if not, it rejects with a validation error. All built-in components pass validation.
    - **Validates: Requirements 3.2, 3.3**

  - [x] 4.8 Implement the Component Palette sidebar with search and drag-to-canvas
    - Wire `Sidebar.tsx` to load component definitions from JSON files
    - Implement categorized display and real-time search filtering
    - Implement drag-from-palette-to-canvas using Konva drag events, calling `snapToPosition` on drop
    - _Requirements: 3.4, 3.5, 2.4_

  - [x]* 4.9 Write property test: Component Search Filter Correctness (Property 7)
    - **Property 7: Component Search Filter Correctness** — For any search query and component set, every returned component contains the query (case-insensitive) in name or category; no matching component is excluded.
    - **Validates: Requirements 3.5**

  - [x] 4.10 Implement draggable component rendering on the canvas
    - Create `components/canvas/ComponentRenderer.tsx` that renders placed components (LED, button) on the Konva canvas with drag support
    - Components snap to breadboard rows or grid on drag-end
    - LED renders with on/off visual states based on pin state from Zustand store
    - Button renders with pressed/released visual states, dispatches pin state change on click
    - _Requirements: 2.4, 3.1_

  - **Key files**: `components/canvas/BreadboardRenderer.tsx`, `lib/canvas/snap.ts`, `lib/components/types.ts`, `lib/components/schema.ts`, `lib/components/definitions/*.json`, `components/layout/Sidebar.tsx`, `components/canvas/ComponentRenderer.tsx`
  - **Test plan**: Verify breadboard renders with correct topology. Drag LED and button from palette onto breadboard, confirm snap-to-grid. Search components in palette. Run property tests for Properties 3–7.

- [x] 5. Checkpoint — Breadboard and components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Basic wiring engine
  - [x] 6.1 Implement wire creation via click-drag between pins
    - Create `lib/wiring/engine.ts` with `createWire(startPin, endPin)` function
    - Generate smooth bezier curve control points between start and end positions
    - Auto-snap endpoints to nearest valid pin within 10px tolerance
    - Assign unique ID to each wire
    - Store wires in Zustand project store
    - _Requirements: 4.1, 4.3_

  - [x]* 6.2 Write property test: Wire Creation Validity (Property 8)
    - **Property 8: Wire Creation Validity** — For any two valid pin references, creating a wire produces a Wire with valid ID, correct start/end refs, non-empty bezier control points, and a color assignment.
    - **Validates: Requirements 4.1**

  - [x] 6.3 Implement wire color auto-assignment
    - Create `lib/wiring/color.ts` with `assignWireColor(startPin, endPin)` function
    - Red for power pins, black for ground, green for I2C/SPI data, blue for all other GPIO/signal
    - Power and ground take precedence over signal types
    - _Requirements: 4.2_

  - [x]* 6.4 Write property test: Wire Color Auto-Assignment (Property 9)
    - **Property 9: Wire Color Auto-Assignment** — For any wire, color is red if either pin is power, black if ground, green if I2C/SPI, blue otherwise. Power/ground take precedence.
    - **Validates: Requirements 4.2**

  - [x]* 6.5 Write property test: Wire Endpoint Snap (Property 10)
    - **Property 10: Wire Endpoint Snap** — For any endpoint position and pin set, snap returns the nearest pin within 10px or null. If returned, no other pin is closer.
    - **Validates: Requirements 4.3**

  - [x] 6.6 Implement wire rendering on the Konva canvas
    - Create `components/canvas/WireRenderer.tsx` rendering bezier curves with assigned colors
    - Support click-to-select a wire for repositioning or deletion (Requirement 4.7)
    - Render wires with physics-light visual bend responding to endpoint repositioning (Requirement 4.8)
    - _Requirements: 4.1, 4.7, 4.8_

  - [x] 6.7 Implement short-circuit detection stub and console warning
    - Create `lib/wiring/validator.ts` with connectivity graph builder and BFS-based short-circuit detection
    - If a power node reaches a ground node through zero-resistance paths, emit a short-circuit warning
    - Display visual warning indicator on affected wires and a descriptive message in the console within 100ms
    - _Requirements: 4.4_

  - [x]* 6.8 Write property test: Electrical Hazard Detection (Property 11)
    - **Property 11: Electrical Hazard Detection** — For any connectivity graph, if power reaches ground through zero-resistance paths, a short-circuit warning is emitted. Over-voltage warnings emitted when source voltage exceeds component rating.
    - **Validates: Requirements 4.4, 4.5**

  - [x] 6.9 Implement breadboard electrical continuity tracking
    - Extend `lib/wiring/validator.ts` to build full connectivity graph including breadboard bus connections
    - Two pins are connected iff a path exists through wires and/or breadboard bus connections
    - _Requirements: 4.9_

  - [x]* 6.10 Write property test: Electrical Continuity Detection (Property 12)
    - **Property 12: Electrical Continuity Detection** — For any set of wires and breadboard connections, two pins are reported connected iff a path exists between them through wires and/or breadboard bus connections.
    - **Validates: Requirements 4.6, 4.9**

  - **Key files**: `lib/wiring/engine.ts`, `lib/wiring/color.ts`, `lib/wiring/validator.ts`, `lib/wiring/types.ts`, `components/canvas/WireRenderer.tsx`
  - **Test plan**: Create wires between board GPIO pins and LED/button pins on breadboard. Verify bezier rendering, correct color coding, snap behavior. Create a direct power-to-ground wire and confirm short-circuit warning appears in console. Run property tests for Properties 8–12.

- [x] 7. Checkpoint — Wiring engine
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Minimal GPIO Mock Layer + Pyodide integration
  - [x] 8.1 Implement the GPIO Mock Layer with SharedArrayBuffer pin state
    - Create `lib/simulation/gpio-mock.ts` implementing the `GPIOMockLayer` interface
    - Allocate `SharedArrayBuffer` (40 pins × 4 bytes = 160 bytes) for pin state: mode, value, PWM duty, flags
    - Implement polling loop on main thread that reads pin state changes from the buffer and dispatches to Zustand store
    - Support both Pi 4 and Pi 5 board models (GPIO Zero works identically on both)
    - _Requirements: 7.2, 7.3a, 7.3b_

  - [ ]* 8.2 Write property test: GPIO Zero Cross-Model Compatibility (Property 17)
    - **Property 17: GPIO Zero Cross-Model Compatibility** — For any GPIO Zero operation and valid GPIO pin, the result is identical regardless of Pi 4 or Pi 5 board model.
    - **Validates: Requirements 7.2**

  - [ ]* 8.3 Write property test: GPIO Pin State Synchronization (Property 18)
    - **Property 18: GPIO Pin State Synchronization** — For any valid pin and state change, writing to SharedArrayBuffer from one side results in the other side reading identical state. Zustand store matches buffer after sync.
    - **Validates: Requirements 7.3a, 7.3b**

  - [x] 8.4 Implement the Pyodide simulation engine with Web Worker
    - Create `lib/simulation/engine.ts` implementing the `SimulationEngine` interface
    - Create `lib/simulation/worker.ts` as the Web Worker entry point
    - Lazy-load Pyodide WASM on first Play click (target: ready within 5 seconds)
    - Mount virtual filesystem with `_piforge_gpio` Python package that monkey-patches `gpiozero.pins` and `RPi.GPIO`
    - Implement `start(code)`, `pause()`, `resume()`, `reset()` control methods
    - Capture stdout/stderr via custom stream redirects and pipe to console store
    - Implement watchdog timer (10s default) for infinite loop detection
    - _Requirements: 7.1, 7.4, 7.5, 7.6, 14.4_

  - [ ]* 8.5 Write property test: Pause Preserves All State (Property 19)
    - **Property 19: Pause Preserves All State** — For any simulation state, pausing does not modify any pin state. States before and after pause are identical.
    - **Validates: Requirements 7.4**

  - [ ]* 8.6 Write property test: Reset Clears All State to Defaults (Property 20)
    - **Property 20: Reset Clears All State to Defaults** — For any simulation state, reset sets all 40 pins to mode=INPUT, value=LOW, pwmDuty=0, pullMode=none, edgeDetect=none.
    - **Validates: Requirements 7.5**

  - [ ]* 8.7 Write property test: Console Output Correctness (Property 21)
    - **Property 21: Console Output Correctness** — For any string written to stdout/stderr, a corresponding ConsoleEntry appears with correct stream type and exact text content.
    - **Validates: Requirements 7.6**

  - [x] 8.8 Wire Play/Pause/Reset controls in the top bar to the simulation engine
    - Connect TopBar Play button to `engine.start(code)` with code from the Zustand store
    - Connect Pause button to `engine.pause()`, Reset to `engine.reset()`
    - Update simulation state indicator in the top bar (idle/running/paused/error)
    - _Requirements: 7.1, 7.4, 7.5_

  - [x] 8.9 Implement visual feedback loop: GPIO state → canvas component updates
    - When GPIO mock detects pin 17 HIGH (for example), find the LED component wired to GPIO 17 and update its visual state to "on" within 50ms
    - When user clicks a button component on canvas, set the corresponding GPIO pin HIGH and deliver edge event to running code within 50ms
    - Batch state updates at 60Hz via `requestAnimationFrame`
    - _Requirements: 7.3a, 7.3b, 14.2_

  - [x] 8.10 Create a working GPIO Zero blink example template and verify end-to-end
    - Add a "GPIO Zero LED Blink" starter template to `lib/templates/` that imports gpiozero, creates an LED on pin 17, and blinks it
    - Wire template selection in the Monaco editor panel
    - Verify: user selects template → clicks Play → Pyodide loads → code runs → virtual LED on canvas blinks on/off
    - _Requirements: 6.2, 6.3, 7.1_

  - **Key files**: `lib/simulation/gpio-mock.ts`, `lib/simulation/engine.ts`, `lib/simulation/worker.ts`, `lib/simulation/_piforge_gpio/` (Python package), `lib/templates/blink.py`, `components/layout/TopBar.tsx`, `components/canvas/ComponentRenderer.tsx`
  - **Test plan**: Run the GPIO Zero blink template end-to-end: Play → LED blinks on canvas → Pause preserves LED state → Reset turns LED off. Click a button component while code listens for `button.when_pressed` and verify callback fires. Check console shows print output. Run property tests for Properties 17–21.

- [x] 9. Checkpoint — GPIO + Pyodide integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Project serialization, persistence, and export
  - [x] 10.1 Implement project serialization and deserialization with Zod schema validation
    - Create `lib/serialization/schema.ts` with the `ProjectFileSchema` Zod schema (as defined in design)
    - Create `lib/serialization/serializer.ts` with `serialize(state): ProjectFile` and `deserialize(json): ProjectState` functions
    - Implement schema version field and migration framework (`migrations` record)
    - Reject invalid files with descriptive error messages
    - _Requirements: 16.1, 16.2, 16.3, 8.1, 8.2_

  - [ ]* 10.2 Write property test: Project Serialization Round-Trip (Property 22)
    - **Property 22: Project Serialization Round-Trip** — For any valid project state, serialize → deserialize produces equivalent state (same board, components, wires, code, settings).
    - **Validates: Requirements 16.1, 8.1, 8.2**

  - [ ]* 10.3 Write property test: Schema Validation Rejects Invalid Files (Property 24)
    - **Property 24: Schema Validation Rejects Invalid Files** — For any JSON not conforming to ProjectFile schema, the deserializer rejects it with a descriptive error. No partial state loaded.
    - **Validates: Requirements 16.2**

  - [ ]* 10.4 Write property test: Schema Migration Produces Valid Files (Property 25)
    - **Property 25: Schema Migration Produces Valid Current-Version Files** — For any valid older-version ProjectFile, migration produces a valid current-version file passing schema validation.
    - **Validates: Requirements 16.3**

  - [x] 10.5 Implement Save/Load to LocalStorage
    - Wire Save button in TopBar to `serialize()` → `localStorage.setItem()`
    - On app load, check LocalStorage for saved project and `deserialize()` to restore state
    - Handle `QuotaExceededError` gracefully
    - _Requirements: 8.1, 8.2_

  - [x] 10.6 Implement PNG export and Build Guide export
    - PNG export: use Konva `stage.toDataURL()` at 2x resolution, convert to downloadable PNG blob (min 1920×1080)
    - Build Guide export: iterate components and wires, generate Markdown document with parts list, wiring table, and code
    - Wire both to the Export menu in the TopBar
    - _Requirements: 9.1, 9.4_

  - [ ]* 10.7 Write property test: Build Guide Contains All Project Information (Property 26)
    - **Property 26: Build Guide Contains All Project Information** — For any project with at least one component and one wire, the build guide contains every component name, every wire connection, and the full code content.
    - **Validates: Requirements 9.4**

  - **Key files**: `lib/serialization/schema.ts`, `lib/serialization/serializer.ts`, `lib/export/png.ts`, `lib/export/build-guide.ts`, `components/layout/TopBar.tsx`
  - **Test plan**: Save a project with board + components + wires + code → reload page → verify full state restored. Export PNG and verify image. Export Build Guide and verify all components/wires/code listed. Run property tests for Properties 22, 24, 25, 26.

- [-] 11. Monaco editor integration and starter templates
  - [ ] 11.1 Integrate Monaco editor in the right panel
    - Wire `@monaco-editor/react` into `RightPanel.tsx` with Python syntax highlighting, autocomplete, and error underlining
    - Connect editor content to `setCode` action in Zustand store
    - Apply dark-mode theme consistent with application theme
    - _Requirements: 6.1, 6.4, 6.5_

  - [x] 11.2 Add starter templates and template selection UI
    - Create `lib/templates/` with template definitions: GPIO Zero LED blink, RPi.GPIO button read, button-controlled servo, traffic light state machine, DHT22 sensor dashboard
    - Create template selector dropdown/menu in the right panel
    - Selecting a template populates the editor and sets the language mode
    - _Requirements: 6.2, 6.3_

  - [ ]* 11.3 Write property test: Template Population (Property 16)
    - **Property 16: Template Population** — For any template, selecting it sets editor content to a non-empty string and language mode to the template's declared language.
    - **Validates: Requirements 6.3**

  - **Key files**: `components/layout/RightPanel.tsx`, `lib/templates/*.py`, `lib/templates/registry.ts`
  - **Test plan**: Open each template, verify editor populates with correct code and language mode. Run property test for Property 16.

- [-] 12. PWA shell and offline support
  - [ ] 12.1 Configure PWA manifest and service worker
    - Create `public/manifest.json` with app name, icons, theme color, display mode
    - Configure service worker (via `next-pwa` or custom) to cache all app assets (HTML, CSS, JS, WASM, component JSON)
    - Implement update detection and refresh prompt
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - **Key files**: `public/manifest.json`, `next.config.ts`, service worker config
  - **Test plan**: Build production app, verify installable as PWA. Disconnect network, verify app loads from cache and simulation works offline.

- [ ] 13. Final checkpoint — Full Phase 1 integration
  - Ensure all tests pass, ask the user if questions arise.
  - Verify end-to-end flow: place Pi 5 board → add breadboard → drag LED + button → wire GPIO 17 to LED, GPIO 4 to button → select blink template → Play → LED blinks → click button → callback fires → Pause → Reset → Save → Reload → state restored → Export PNG → Export Build Guide.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document (Properties 1–26, Phase 1 relevant subset)
- Properties 13, 14, 15 (Touchscreen) and Property 23 (Share Link) are deferred — touchscreen simulation and share links are lower priority within Phase 1 and can be added as a follow-up
- Phase 2 items (3D view, collaboration, Fritzing export, GitHub Gist export, full DSI emulation) are NOT included
- All code is client-side, MIT licensed
- Use fast-check for property-based tests, Vitest as the test runner
