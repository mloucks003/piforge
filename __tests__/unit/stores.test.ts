import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({
      boardModel: 'pi4',
      components: {},
      wires: {},
      pinStates: {},
      code: '',
      language: 'python',
      simulationState: 'idle',
      consoleOutput: [],
    });
  });

  it('initializes with pi4 board model', () => {
    expect(useProjectStore.getState().boardModel).toBe('pi4');
  });

  it('setBoardModel switches to pi5', () => {
    useProjectStore.getState().setBoardModel('pi5');
    expect(useProjectStore.getState().boardModel).toBe('pi5');
  });

  it('addComponent adds a component and returns an id', () => {
    const id = useProjectStore.getState().addComponent(
      {
        id: 'led-red',
        name: 'Red LED',
        category: 'led',
        pins: [
          { id: 'anode', label: 'Anode', type: 'signal', position: { x: 0, y: 0 }, direction: 'in' },
          { id: 'cathode', label: 'Cathode', type: 'ground', position: { x: 0, y: 10 }, direction: 'out' },
        ],
      },
      { x: 100, y: 200 }
    );
    expect(id).toBeTruthy();
    const comp = useProjectStore.getState().components[id];
    expect(comp.definitionId).toBe('led-red');
    expect(comp.position).toEqual({ x: 100, y: 200 });
  });

  it('removeComponent removes a component', () => {
    const id = useProjectStore.getState().addComponent(
      { id: 'btn', name: 'Button', category: 'button', pins: [] },
      { x: 0, y: 0 }
    );
    useProjectStore.getState().removeComponent(id);
    expect(useProjectStore.getState().components[id]).toBeUndefined();
  });

  it('setCode updates code', () => {
    useProjectStore.getState().setCode('print("hello")');
    expect(useProjectStore.getState().code).toBe('print("hello")');
  });

  it('setPinState sets and merges pin state', () => {
    useProjectStore.getState().setPinState(17, { mode: 'output', value: 1 });
    const pin = useProjectStore.getState().pinStates[17];
    expect(pin.mode).toBe('output');
    expect(pin.value).toBe(1);
    expect(pin.pwmDuty).toBe(0); // default preserved
  });
});

describe('canvasStore', () => {
  beforeEach(() => {
    useCanvasStore.setState({
      viewport: { x: 0, y: 0, scale: 1 },
      selectedIds: [],
      snapToGrid: true,
      gridSize: 10,
    });
  });

  it('initializes with default viewport', () => {
    const { viewport } = useCanvasStore.getState();
    expect(viewport).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it('setViewport updates partially', () => {
    useCanvasStore.getState().setViewport({ scale: 2 });
    expect(useCanvasStore.getState().viewport.scale).toBe(2);
    expect(useCanvasStore.getState().viewport.x).toBe(0);
  });

  it('toggleSnapToGrid flips the flag', () => {
    expect(useCanvasStore.getState().snapToGrid).toBe(true);
    useCanvasStore.getState().toggleSnapToGrid();
    expect(useCanvasStore.getState().snapToGrid).toBe(false);
  });

  it('setGridSize updates grid size', () => {
    useCanvasStore.getState().setGridSize(20);
    expect(useCanvasStore.getState().gridSize).toBe(20);
  });
});
