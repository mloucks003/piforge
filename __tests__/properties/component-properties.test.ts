import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateComponentDefinition } from '@/lib/components/schema';
import { componentDefinitions, searchComponents } from '@/lib/components';

// Feature: piforge, Property 6: Component Schema Validation
// **Validates: Requirements 3.2, 3.3**
describe('Property 6: Component Schema Validation', () => {
  // Valid component definition arbitrary
  const validPinArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    label: fc.string({ minLength: 1, maxLength: 30 }),
    type: fc.constantFrom('power', 'ground', 'signal', 'data') as fc.Arbitrary<'power' | 'ground' | 'signal' | 'data'>,
    position: fc.record({ x: fc.integer({ min: -100, max: 100 }), y: fc.integer({ min: -100, max: 100 }) }),
    direction: fc.constantFrom('in', 'out', 'bidirectional') as fc.Arbitrary<'in' | 'out' | 'bidirectional'>,
  });

  const validDefArb = fc.record({
    id: fc.string({ minLength: 1, maxLength: 30 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    category: fc.constantFrom('led', 'button', 'switch', 'potentiometer', 'buzzer', 'sensor', 'motor', 'display', 'keypad', 'touchscreen', 'passive'),
    pins: fc.array(validPinArb, { minLength: 1, maxLength: 10 }),
    visual: fc.record({
      width: fc.integer({ min: 1, max: 200 }),
      height: fc.integer({ min: 1, max: 200 }),
      states: fc.constant({ off: 'off', on: 'on' }),
    }),
    simulation: fc.record({
      type: fc.constantFrom('digital-output', 'digital-input', 'analog-input', 'pwm', 'i2c-device', 'spi-device', 'display'),
      handler: fc.string({ minLength: 1 }),
      properties: fc.constant({}),
    }),
    defaultProperties: fc.constant({}),
  });

  it('valid component definitions are accepted', () => {
    fc.assert(
      fc.property(validDefArb, (def) => {
        const result = validateComponentDefinition(def);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('all built-in components pass validation', () => {
    for (const def of componentDefinitions) {
      const result = validateComponentDefinition(def);
      expect(result.success).toBe(true);
    }
  });

  it('invalid objects are rejected', () => {
    // Generate objects missing required fields
    const invalidArb = fc.oneof(
      // Missing name
      fc.record({ id: fc.string({ minLength: 1 }) }),
      // Empty object
      fc.constant({}),
      // Wrong types
      fc.record({ id: fc.constant(123), name: fc.constant(true) }),
      // Missing pins
      fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        category: fc.constant('led'),
        pins: fc.constant([]),
      }),
    );

    fc.assert(
      fc.property(invalidArb, (obj) => {
        const result = validateComponentDefinition(obj);
        expect(result.success).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: piforge, Property 7: Component Search Filter Correctness
// **Validates: Requirements 3.5**
describe('Property 7: Component Search Filter Correctness', () => {
  const queryArb = fc.string({ minLength: 0, maxLength: 20 });

  it('every returned component contains the query in name or category', () => {
    fc.assert(
      fc.property(queryArb, (query) => {
        const results = searchComponents(query);
        const q = query.toLowerCase();

        if (q.trim() === '') {
          // Empty query returns all
          expect(results.length).toBe(componentDefinitions.length);
        } else {
          for (const comp of results) {
            const nameMatch = comp.name.toLowerCase().includes(q);
            const catMatch = comp.category.toLowerCase().includes(q);
            expect(nameMatch || catMatch).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('no matching component is excluded from results', () => {
    fc.assert(
      fc.property(queryArb, (query) => {
        const results = searchComponents(query);
        const q = query.toLowerCase();

        if (!q.trim()) return; // empty query returns all, already tested

        const resultIds = new Set(results.map((r: any) => r.id));

        for (const def of componentDefinitions) {
          const nameMatch = def.name.toLowerCase().includes(q);
          const catMatch = def.category.toLowerCase().includes(q);
          if (nameMatch || catMatch) {
            expect(resultIds.has(def.id)).toBe(true);
          }
        }
      }),
      { numRuns: 100 }
    );
  });
});
