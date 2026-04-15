export type CompletionCondition =
  | { type: 'component-placed'; definitionId: string }
  | { type: 'wire-created' }
  | { type: 'code-contains'; snippet: string }
  | { type: 'simulation-started' }
  | { type: 'breadboard-added' }
  | { type: 'board-selected'; model: string }
  | { type: 'manual' };

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  completionCondition: CompletionCondition;
  hints?: string[];
  /** data-tour attribute of the UI element to spotlight during this step */
  tourTarget?: string;
}

export interface TutorialDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  steps: TutorialStep[];
}
