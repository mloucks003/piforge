# Requirements Document

## Introduction

PiForge is a production-quality, open-source, browser-first web application that serves as the ultimate virtual Raspberry Pi laboratory. Users can drag realistic Pi 4 or Pi 5 boards onto an infinite canvas, wire up breadboards with high-fidelity components (including programmable touchscreens), write and run code instantly via in-browser execution, and prototype full IoT/robot projects without purchasing physical hardware. The application targets makers, students, and IoT builders, prioritizing realism, performance (60 fps with 50+ components), and fun. It ships as a PWA (offline-capable, installable), uses a modern Next.js 15 + React 19 + TypeScript stack, and is licensed under MIT.

## Glossary

- **PiForge**: The web application described in this document — a virtual Raspberry Pi laboratory.
- **Canvas**: The central, pannable and zoomable workspace where boards, breadboards, components, and wires are placed and manipulated.
- **Board_Renderer**: The subsystem responsible for rendering accurate 2D schematic and optional 3D views of Raspberry Pi boards.
- **Component_Library**: A JSON-based, extensible catalog of electronic components (LEDs, sensors, motors, displays, etc.) available for placement on the Canvas.
- **Wiring_Engine**: The subsystem that manages creation, rendering, validation, and simulation of electrical connections between pins, component legs, and breadboard rails.
- **Breadboard**: A virtual solderless breadboard with power rails and internal bus connections, rendered on the Canvas.
- **Simulation_Engine**: The subsystem that executes user code in-browser (via Pyodide/WASM) and synchronizes GPIO state bidirectionally with the visual circuit.
- **GPIO_Mock_Layer**: A custom TypeScript layer that emulates Raspberry Pi GPIO hardware, bridging the Simulation_Engine and the visual circuit state.
- **Touchscreen_Simulator**: The subsystem that renders live display output from running code and relays touch/mouse input events back into the Simulation_Engine.
- **Monaco_Editor**: The integrated code editor (Monaco) used for writing Python, MicroPython, and C++ code within PiForge.
- **State_Store**: The Zustand-based global state management layer.
- **Project_File**: A JSON document that fully serializes a PiForge project (board model, components, wires, code, settings).
- **Export_Engine**: The subsystem responsible for exporting projects as PNG wiring diagrams, Fritzing-compatible files, GitHub gists, or hardware build guides.
- **PWA_Shell**: The Progressive Web App wrapper that enables offline use and installation.
- **Collaboration_Service**: An optional WebSocket-based service enabling real-time multi-user editing of a project.
- **AI_Helper**: An integrated assistant pane that provides contextual help, code suggestions, and circuit debugging tips.
- **Pin**: A single electrical connection point on a board, component, or breadboard rail, identified by a unique label or number.
- **Short_Circuit**: A condition where power and ground are connected with insufficient resistance, which the Wiring_Engine detects and warns about.
- **DSI**: Display Serial Interface — the connector used by official Raspberry Pi touchscreens.
- **SPI**: Serial Peripheral Interface — a synchronous serial communication protocol used by some displays and sensors.
- **I2C**: Inter-Integrated Circuit — a multi-master serial communication bus used by many sensors and displays.

## Requirements

### Requirement 1: Board Model Selection and Rendering

**User Story:** As a maker, I want to place an accurate Raspberry Pi 4 or Pi 5 board on the canvas, so that I can prototype circuits against the correct pinout and physical layout.

#### Acceptance Criteria

1. THE Board_Renderer SHALL render a Raspberry Pi 4 Model B with a 40-pin GPIO header displaying correct pinout labels, USB ports, dual micro-HDMI ports, Ethernet port, CSI camera connector, DSI display connector, USB-C power port, and physical dimensions proportional to the real board (85.6 mm × 56.5 mm).
2. THE Board_Renderer SHALL render a Raspberry Pi 5 with a 40-pin GPIO header displaying correct pinout labels, USB ports, dual micro-HDMI ports, Ethernet port, CSI/DSI connectors, USB-C power port, PCIe connector, and physical dimensions proportional to the real board (~85 mm × 56–58 mm). Exact mounting hole positions SHALL match official Raspberry Pi 5 mechanical drawings for accuracy.
3. THE Board_Renderer SHALL render both boards with proportional scaling for display, and port/connector placement SHALL follow the official mechanical drawings for each model.
4. WHEN the user activates the model switcher in the top bar, THE Board_Renderer SHALL toggle the displayed board between Raspberry Pi 4 and Raspberry Pi 5 within 200 ms. THE 40-pin GPIO header is physically identical between Pi 4 and Pi 5 (backward compatible, pins 1–40).
5. WHEN the user selects the 3D view mode, THE Board_Renderer SHALL render a rotatable 3D model of the selected board using @react-three/fiber with realistic PCB textures, component placement, and LED indicators that reflect current simulation state. (Phase 2 — not required for v1 launch.)
6. THE Board_Renderer SHALL render the 2D schematic view as the default view mode.

### Requirement 2: Breadboard and Canvas System

**User Story:** As a maker, I want an infinite, pannable, zoomable canvas with reusable breadboards, so that I can lay out complex circuits without space constraints.

#### Acceptance Criteria

1. THE Canvas SHALL support pan (click-drag or two-finger scroll) and zoom (scroll wheel or pinch) operations with no perceptible input lag at up to 50 placed components.
2. WHEN the user adds a Breadboard to the Canvas, THE Canvas SHALL render the Breadboard with clearly labeled power rails (positive and negative) and internal bus connections matching standard 830-point breadboard topology.
3. THE Canvas SHALL allow placement of multiple Breadboards simultaneously with independent positioning.
4. WHEN the user drags a component from the Component_Library onto the Canvas, THE Canvas SHALL snap the component to the nearest valid Breadboard row or free canvas position.
5. THE Canvas SHALL maintain 60 frames per second rendering performance with up to 50 simultaneously placed components and their associated wires.

### Requirement 3: Component Library

**User Story:** As a maker, I want a rich, extensible library of electronic components, so that I can prototype diverse circuits without limitations.

#### Acceptance Criteria

1. THE Component_Library SHALL include the following component categories: LEDs (red, green, blue, yellow, white), tactile buttons, toggle switches, potentiometers, piezo buzzers, DHT22 temperature/humidity sensors, HC-SR04 ultrasonic sensors, PIR motion sensors, DS18B20 temperature sensors, SG90 servo motors, DC motors, 4×4 matrix keypads, SSD1306 OLED displays, 7-segment displays, official Raspberry Pi 7-inch DSI touchscreen, and Waveshare 3.5-inch/5-inch/7-inch TFT touchscreens.
2. THE Component_Library SHALL store each component definition as a JSON object containing: component name, category, pin definitions (labels, types, positions), visual asset references, simulation behavior descriptor, and default property values.
3. WHEN the user adds a custom component JSON definition to the Component_Library, THE Component_Library SHALL validate the JSON against the component schema and make the component available in the palette within the current session.
4. THE Component_Library SHALL display components in a searchable, categorized sidebar palette on the left side of the interface.
5. WHEN the user searches the Component_Library palette, THE Component_Library SHALL filter visible components to match the search query in real time.

### Requirement 4: Wiring Engine

**User Story:** As a maker, I want to draw realistic, color-coded wires between any pins, legs, and rails, so that I can build circuits that look and behave like real wiring.

#### Acceptance Criteria

1. WHEN the user click-drags from one Pin to another Pin, THE Wiring_Engine SHALL create a wire connection rendered as a smooth bezier curve between the two endpoints.
2. THE Wiring_Engine SHALL color-code wires by connection type: red for power (VCC/3.3V/5V), black for ground, blue for signal/GPIO, and green for data bus (I2C/SPI) lines.
3. WHEN a wire is created, THE Wiring_Engine SHALL auto-snap wire endpoints to the nearest valid Pin within a 10-pixel tolerance radius.
4. WHEN the user creates a connection that results in a Short_Circuit, THE Wiring_Engine SHALL display a visual warning indicator on the affected wire and a descriptive message in the console within 100 ms.
5. WHEN the user creates a connection that exceeds the voltage or current rating of a connected component, THE Wiring_Engine SHALL display an over-voltage or over-current warning on the affected component.
6. THE Wiring_Engine SHALL simulate basic current flow direction and display animated flow indicators on wires during active simulation.
7. WHEN the user clicks on an existing wire, THE Wiring_Engine SHALL allow the user to reposition the wire path or delete the wire.
8. THE Wiring_Engine SHALL render wires with a physics-light visual bend that responds to endpoint repositioning.
9. THE Wiring_Engine SHALL detect and display electrical continuity status for all connected paths on the Breadboard.

### Requirement 5: Programmable Touchscreen Simulation

**User Story:** As a maker, I want to attach virtual touchscreens to the Pi and see live display output from my code while sending touch events back, so that I can prototype touchscreen-based projects entirely in the browser.

#### Acceptance Criteria

1. WHEN the user connects a touchscreen component to the board, THE Touchscreen_Simulator SHALL activate a virtual display panel on the Canvas sized to match the selected touchscreen resolution. For the official 7" DSI touchscreen, a "simulated DSI" flag SHALL auto-wire the display to the board's DSI port with touch input routed via I2C. For Waveshare TFT touchscreens, the connection SHALL use SPI for display data with a separate touch controller channel.
2. WHILE the Simulation_Engine is running code that writes to the framebuffer, THE Touchscreen_Simulator SHALL render the framebuffer output on the virtual display panel at a minimum of 15 frames per second.
3. WHEN the user clicks or taps on the virtual display panel, THE Touchscreen_Simulator SHALL send the corresponding X and Y coordinates as touch input events to the Simulation_Engine with less than 50 ms latency.
4. WHEN the user performs a multi-touch gesture (pinch or two-finger drag) on the virtual display panel, THE Touchscreen_Simulator SHALL send multi-touch event data (two or more contact points with X/Y coordinates) to the Simulation_Engine.
5. WHEN the user activates calibration mode for a connected touchscreen, THE Touchscreen_Simulator SHALL display a calibration target sequence and map raw touch coordinates to display coordinates based on user input.
6. THE Touchscreen_Simulator SHALL support rendering output from pygame, PIL/Pillow, and direct canvas drawing APIs executed within the Simulation_Engine. The v1 implementation SHALL use a virtual framebuffer canvas that Python code draws to (via pygame or PIL in Pyodide), with mouse/touch events mapped back as Linux-style input events. Full DSI protocol emulation is deferred to Phase 2.

### Requirement 6: Code Editor and Templates

**User Story:** As a developer, I want a full-featured code editor with language templates, so that I can write and edit Pi code efficiently within the application.

#### Acceptance Criteria

1. THE Monaco_Editor SHALL provide syntax highlighting, auto-completion, and error underlining for Python, MicroPython, and C++ languages.
2. THE Monaco_Editor SHALL include starter templates for: GPIO Zero (Python) LED blink, RPi.GPIO (Python) button read, MicroPython pin toggle, C++ GPIO access, button-controlled servo, simple touchscreen counter (pygame), DHT22 sensor dashboard, traffic light state machine, ultrasonic distance display, and a basic roaming robot chassis controller.
3. WHEN the user selects a template from the template menu, THE Monaco_Editor SHALL populate the editor with the selected template code and set the language mode accordingly.
4. THE Monaco_Editor SHALL be displayed in the right panel of the interface layout.
5. THE Monaco_Editor SHALL support dark-mode theming consistent with the application theme.

### Requirement 7: In-Browser Simulation Engine

**User Story:** As a maker, I want my code to run instantly in the browser and interact with the virtual circuit in real time, so that I can test and iterate without any external tools or latency.

#### Acceptance Criteria

1. WHEN the user clicks the Play button, THE Simulation_Engine SHALL execute the current editor code using Pyodide (for Python) or WASM (for C++) entirely within the browser with no server round-trip.
2. THE GPIO_Mock_Layer SHALL support both Pi 4 and Pi 5 GPIO driver models. GPIO Zero code SHALL work seamlessly on both board models. WHEN the user writes code using low-level RPi.GPIO on a Pi 5 board, THE GPIO_Mock_Layer SHALL either emulate the RP1 southbridge pinctrl behavior or display a compatibility warning suggesting GPIO Zero as the portable alternative.
3. WHEN running code sets a GPIO pin to HIGH, THE GPIO_Mock_Layer SHALL update the corresponding Pin state and THE Canvas SHALL reflect the change visually (e.g., LED illuminates) within 50 ms.
3. WHEN the user interacts with a simulated input component (e.g., clicks a button on the Canvas), THE GPIO_Mock_Layer SHALL update the corresponding Pin state and THE Simulation_Engine SHALL deliver the edge event to the running code within 50 ms.
4. WHEN the user clicks the Pause button, THE Simulation_Engine SHALL suspend code execution while preserving all GPIO and component state.
5. WHEN the user clicks the Reset button, THE Simulation_Engine SHALL terminate code execution and reset all GPIO pins and component states to their default values.
6. THE Simulation_Engine SHALL display standard output and standard error from running code in the bottom console panel in real time.
7. THE Simulation_Engine SHALL provide step debugger functionality including breakpoints, step-over, step-into, and a variable watch panel.
8. THE Simulation_Engine SHALL provide a simulated WiFi/Ethernet network interface stub that allows MQTT publish/subscribe operations within the browser environment.
9. THE Simulation_Engine SHALL provide a simulated camera preview stub that returns a static or procedurally generated test image when camera capture is invoked in code.

### Requirement 8: Project Persistence and Sharing

**User Story:** As a maker, I want to save, load, and share my projects, so that I can resume work and collaborate with others.

#### Acceptance Criteria

1. WHEN the user clicks Save, THE State_Store SHALL serialize the complete project state (board model, component placements, wire connections, code, editor settings) into a Project_File JSON document and persist it to browser LocalStorage.
2. WHEN the user opens PiForge with a previously saved project in LocalStorage, THE State_Store SHALL deserialize the Project_File and restore the full project state.
3. WHEN the user clicks Share, THE State_Store SHALL generate a shareable public link that encodes or references the Project_File, enabling another user to load the project by visiting the link.
4. WHERE optional cloud storage is configured (Supabase or Firebase), THE State_Store SHALL persist Project_Files to the configured cloud backend in addition to LocalStorage.
5. THE Project_File SHALL use a documented, versioned JSON schema so that future versions of PiForge can migrate older project files.

### Requirement 9: Export Engine (Phase 2 for Fritzing and Gist)

**User Story:** As a maker, I want to export my circuit as an image, a Fritzing file, a GitHub gist, or a hardware build guide, so that I can share designs and transition to real hardware.

#### Acceptance Criteria

1. WHEN the user selects "Export as PNG", THE Export_Engine SHALL render the current Canvas state (board, components, wires, labels) to a PNG image file at a minimum resolution of 1920×1080 pixels.
2. (Phase 2) WHEN the user selects "Export as Fritzing", THE Export_Engine SHALL generate a Fritzing-compatible .fzz file representing the current circuit.
3. (Phase 2) WHEN the user selects "Export as GitHub Gist", THE Export_Engine SHALL create a GitHub Gist containing the Project_File JSON and the current editor code, using the GitHub API with user-provided authentication.
4. WHEN the user selects "Export as Build Guide", THE Export_Engine SHALL generate a human-readable document listing all components, pin connections, wiring instructions, and the associated code for building the circuit with real hardware.

### Requirement 10: User Interface and Layout

**User Story:** As a user, I want a polished, modern dark-mode interface with a clear layout, so that I can work efficiently and enjoyably.

#### Acceptance Criteria

1. THE PiForge SHALL render a layout consisting of: a left sidebar (component palette and library), a central Canvas (pan/zoom workspace), a right panel (properties inspector and code editor), and a bottom console panel.
2. THE PiForge SHALL display a top bar containing: the board model switcher, Play/Pause/Reset simulation controls, Save/Share buttons, Export menu, and application branding.
3. THE PiForge SHALL use a dark-mode color theme by default, implemented with Tailwind CSS and shadcn/ui components.
4. THE PiForge SHALL use lucide-react icons consistently throughout the interface.
5. WHEN the user resizes the browser window, THE PiForge SHALL adjust panel sizes responsively while maintaining a desktop-first layout with a minimum supported viewport width of 1024 pixels.
6. THE PiForge SHALL meet WCAG 2.1 Level AA contrast ratio requirements for all text and interactive elements.

### Requirement 11: Progressive Web App and Offline Support

**User Story:** As a maker, I want to install PiForge on my device and use it offline, so that I can prototype circuits without an internet connection.

#### Acceptance Criteria

1. THE PWA_Shell SHALL serve a valid Web App Manifest that enables installation on desktop and mobile platforms.
2. THE PWA_Shell SHALL register a service worker that caches all application assets (HTML, CSS, JavaScript, WASM binaries, component library JSON) for offline use.
3. WHEN the user launches PiForge without an internet connection, THE PWA_Shell SHALL load the application from the service worker cache and provide full simulation functionality.
4. WHEN the application is updated and the user is online, THE PWA_Shell SHALL detect the update and prompt the user to refresh.

### Requirement 12: Collaboration Support (Phase 2)

**User Story:** As a team member, I want to collaborate on a circuit project in real time with others, so that we can prototype together remotely.

#### Acceptance Criteria

1. WHERE the Collaboration_Service is enabled, WHEN a user modifies the project (moves a component, adds a wire, edits code), THE Collaboration_Service SHALL broadcast the change to all connected users via WebSocket within 200 ms.
2. WHERE the Collaboration_Service is enabled, THE Collaboration_Service SHALL synchronize the full project state for newly joining users within 1 second of connection.
3. WHERE the Collaboration_Service is enabled, THE Collaboration_Service SHALL display a list of currently connected collaborators with distinct cursor colors.

### Requirement 13: AI Helper Pane

**User Story:** As a maker, I want an integrated AI assistant that can help me with code, circuit design, and debugging, so that I can learn and solve problems faster.

#### Acceptance Criteria

1. THE AI_Helper SHALL be accessible from a toggleable pane in the interface.
2. WHEN the user submits a question or request to the AI_Helper, THE AI_Helper SHALL provide a contextual response that considers the current board model, connected components, wiring state, and editor code.
3. WHEN the user requests code generation from the AI_Helper, THE AI_Helper SHALL produce code compatible with the currently selected language and board model.

### Requirement 14: Performance

**User Story:** As a maker, I want the application to remain smooth and responsive even with complex circuits, so that my prototyping experience is never interrupted by lag.

#### Acceptance Criteria

1. THE Canvas SHALL render at 60 frames per second or higher with up to 50 simultaneously placed components and their associated wires on a device with a mid-range GPU (equivalent to Intel UHD 630 or better).
2. WHEN the Simulation_Engine is running, THE GPIO_Mock_Layer SHALL process pin state changes and deliver visual updates to the Canvas within 50 ms.
3. THE PiForge SHALL load the initial application shell (excluding WASM binaries) within 3 seconds on a 10 Mbps connection.
4. THE Simulation_Engine SHALL initialize Pyodide and be ready to execute code within 5 seconds of the user first clicking Play.

### Requirement 15: Technology Stack and Licensing

**User Story:** As a contributor, I want the project to use a modern, well-documented tech stack with an open-source license, so that I can contribute and extend the project confidently.

#### Acceptance Criteria

1. THE PiForge SHALL be built using Next.js 15 (app router), React 19, and TypeScript.
2. THE PiForge SHALL use Tailwind CSS and shadcn/ui for styling and UI components.
3. THE PiForge SHALL use Konva.js (via react-konva) for 2D Canvas rendering and @react-three/fiber with drei for 3D rendering.
4. THE PiForge SHALL use Zustand for global state management.
5. THE PiForge SHALL be licensed under the MIT License.
6. THE PiForge SHALL be structured as a monorepo with clear module boundaries and documented extension points.

### Requirement 16: Project Serialization Round-Trip

**User Story:** As a maker, I want confidence that saving and loading my project preserves every detail exactly, so that I never lose work.

#### Acceptance Criteria

1. FOR ALL valid Project_File JSON documents, serializing a project to a Project_File and then deserializing the Project_File back into project state SHALL produce a project state equivalent to the original (round-trip property).
2. THE State_Store SHALL validate Project_File JSON against the documented schema during deserialization and reject files that do not conform, returning a descriptive error message.
3. WHEN the State_Store encounters a Project_File with an older schema version, THE State_Store SHALL migrate the file to the current schema version before loading.

## Additional Notes and Refinements

- **Board dimensions**: Pi 4 Model B = 85.6 mm × 56.5 mm; Pi 5 ≈ 85 mm × 56–58 mm. Render proportionally with accurate mounting holes and port placement based on official mechanical drawings.
- **GPIO compatibility**: The 40-pin header is physically identical between Pi 4 and Pi 5. Software-wise, Pi 5 uses the RP1 southbridge with pinctrl instead of the legacy raspi-gpio driver. The GPIO_Mock_Layer must support GPIO Zero seamlessly on both models; RPi.GPIO on Pi 5 should either work via a compatibility shim or display a clear warning.
- **Touchscreen implementation strategy (v1)**: Use a virtual framebuffer canvas that Python code (pygame/PIL in Pyodide) draws to. Map browser mouse/touch events back as Linux-style input events. A "simulated DSI" flag auto-wires the official 7" display. Full DSI/SPI protocol emulation is Phase 2.
- **Phase 1 priorities**: Core canvas + wiring + basic components (LED, button, potentiometer, DHT22) + Python/GPIO Zero simulation + one touchscreen example must work first. 3D view, collaboration, Fritzing export, and GitHub Gist export are Phase 2.
- **Phase 2 items**: 3D rotatable board view (Req 1 AC 5), Collaboration Service (Req 12), Fritzing export (Req 9 AC 2), GitHub Gist export (Req 9 AC 3), full DSI protocol emulation.
- **Starter templates**: Include 5–10 maker-friendly templates: blinking LED, button-controlled servo, simple touchscreen counter, sensor dashboard, traffic light, ultrasonic distance display, roaming robot chassis controller.
- **License**: MIT. Repo structure: standard Next.js app with clear `/components`, `/lib/simulation`, `/stores` folders and documented extension points for adding new components and Pi models.
