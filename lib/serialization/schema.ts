import { z } from 'zod';

const PointSchema = z.object({ x: z.number(), y: z.number() });

const PinStateSchema = z.object({
  mode: z.enum(['input', 'output', 'pwm', 'alt']),
  value: z.union([z.literal(0), z.literal(1)]),
  pwmDuty: z.number(),
  pullMode: z.enum(['up', 'down', 'none']),
  edgeDetect: z.enum(['none', 'rising', 'falling', 'both']),
});

const PinRefSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('component'),
    componentId: z.string(),
    pinId: z.string(),
  }),
  z.object({
    type: z.literal('board'),
    boardId: z.string(),
    pinNumber: z.number().int().min(1).max(40),
  }),
  z.object({
    type: z.literal('breadboard'),
    breadboardId: z.string(),
    row: z.number().int(),
    col: z.number().int(),
    rail: z.enum(['positive', 'negative']).optional(),
  }),
]);

const WireWarningSchema = z.object({
  type: z.enum(['short-circuit', 'over-voltage', 'over-current', 'unconnected']),
  message: z.string(),
  severity: z.enum(['error', 'warning']),
});

const PlacedComponentSchema = z.object({
  id: z.string(),
  definitionId: z.string(),
  position: PointSchema,
  rotation: z.number(),
  properties: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
  pinStates: z.record(z.string(), PinStateSchema),
  breadboardId: z.string().optional(),
  breadboardRow: z.number().int().optional(),
});

const PlacedBreadboardSchema = z.object({
  id: z.string(),
  position: PointSchema,
  type: z.enum(['830-point', '400-point']),
});

const WireSchema = z.object({
  id: z.string(),
  startPinRef: PinRefSchema,
  endPinRef: PinRefSchema,
  color: z.enum(['red', 'black', 'blue', 'green', 'yellow', 'white', 'orange']),
  path: z.array(PointSchema),
  validated: z.boolean(),
  warnings: z.array(WireWarningSchema),
});

export const ProjectFileSchema = z.object({
  version: z.number().int().positive(),
  board: z.object({
    model: z.enum(['pi4', 'pi5']),
    position: PointSchema,
  }),
  components: z.record(z.string(), PlacedComponentSchema),
  breadboards: z.record(z.string(), PlacedBreadboardSchema),
  wires: z.record(z.string(), WireSchema),
  code: z.object({
    content: z.string(),
    language: z.enum(['python', 'micropython', 'cpp']),
  }),
});

export type ProjectFileV1 = z.infer<typeof ProjectFileSchema>;

/**
 * Migration registry: key is the TARGET version, value transforms from version-1 → version.
 * Currently only version 1 exists, so no migrations yet.
 */
export const migrations: Record<number, (old: unknown) => unknown> = {
  // Example: 2: (v1) => ({ ...v1, version: 2, newField: 'default' }),
};

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Apply migrations from an older version to the current version.
 */
export function migrateProjectFile(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid project file: not an object');
  }
  let file = data as Record<string, unknown>;
  let version = typeof file.version === 'number' ? file.version : 0;

  if (version < 1) {
    throw new Error('Invalid project file: missing or invalid version');
  }

  while (version < CURRENT_SCHEMA_VERSION) {
    const nextVersion = version + 1;
    const migrateFn = migrations[nextVersion];
    if (!migrateFn) {
      throw new Error(`No migration available from version ${version} to ${nextVersion}`);
    }
    file = migrateFn(file) as Record<string, unknown>;
    version = nextVersion;
  }

  return file;
}

/**
 * Validate a project file against the schema. Returns parsed data or throws.
 */
export function validateProjectFile(data: unknown): ProjectFileV1 {
  const migrated = migrateProjectFile(data);
  const result = ProjectFileSchema.safeParse(migrated);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`
    );
    throw new Error(`Invalid project file:\n${issues.join('\n')}`);
  }
  return result.data;
}
