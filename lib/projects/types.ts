export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProjectTag = 'GPIO' | 'PWM' | 'Sensors' | 'Games' | 'Motors' | 'Display' | 'Audio' | 'pygame' | 'touchscreen';

export interface ProjectComponent {
  definitionId: string;
  quantity: number;
  label: string;           // friendly name shown in UI
}

export interface WiringStep {
  from: string;            // e.g. "GPIO17 (Pin 11)"
  to: string;              // e.g. "LED anode (+)"
  color: string;           // wire color hint
  note?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  tags: ProjectTag[];
  emoji: string;
  components: ProjectComponent[];
  wiring: WiringStep[];
  code: string;
  /** optional template id if it maps to an existing template */
  templateId?: string;
}
