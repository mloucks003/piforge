'use client';

import { useCallback, useEffect } from 'react';
import { Rect } from 'react-konva';
import type Konva from 'konva';
import { useProjectStore } from '@/stores/projectStore';
import { useWiringStore } from '@/stores/wiringStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { snapToPin, createWire } from '@/lib/wiring/engine';
import { validateWiring } from '@/lib/wiring/validator';

/**
 * Invisible interaction layer that handles wiring interactions.
 * - In Wire Mode (toolbar button): click any pin to start/complete a wire
 * - Otherwise: Shift+click on a pin starts a wire
 * - Right-click or Escape cancels the active wire
 */
export default function WiringInteractionLayer({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const boardModel = useProjectStore((s) => s.boardModel);
  const boardPosition = useProjectStore((s) => s.boardPosition);
  const components = useProjectStore((s) => s.components);
  const breadboards = useProjectStore((s) => s.breadboards);
  const wires = useProjectStore((s) => s.wires);
  const addWire = useProjectStore((s) => s.addWire);

  const isDrawing = useWiringStore((s) => s.isDrawing);
  const startPinRef = useWiringStore((s) => s.startPinRef);
  const startWire = useWiringStore((s) => s.startWire);
  const updateMousePosition = useWiringStore((s) => s.updateMousePosition);
  const cancelWire = useWiringStore((s) => s.cancelWire);
  const completeWire = useWiringStore((s) => s.completeWire);

  const wiringMode = useCanvasStore((s) => s.wiringMode);

  // Handle click on canvas
  const handleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      // Transform pointer to canvas coordinates
      const transform = stage.getAbsoluteTransform().copy().invert();
      const canvasPos = transform.point(pointer);

      if (!isDrawing) {
        // Start wire: require Shift key OR wire mode active
        const isShift = 'shiftKey' in e.evt && e.evt.shiftKey;
        if (!isShift && !wiringMode) return;

        const snap = snapToPin(canvasPos, boardModel, boardPosition, components, breadboards);
        if (snap) {
          startWire(snap.ref, snap.position);
          e.cancelBubble = true;
        }
      } else {
        // Complete or cancel wire
        const snap = snapToPin(canvasPos, boardModel, boardPosition, components, breadboards);
        if (snap && startPinRef) {
          const wire = createWire(startPinRef, snap.ref, boardModel, boardPosition, components, breadboards);
          if (wire) {
            addWire(wire);
            const allWires = { ...wires, [wire.id]: wire };
            validateWiring(allWires, breadboards, boardModel, components);
          }
        }
        completeWire();
        e.cancelBubble = true;
      }
    },
    [
      isDrawing, startPinRef, boardModel, boardPosition,
      components, breadboards, wires, addWire,
      startWire, completeWire, wiringMode,
    ]
  );

  // Handle mouse move for wire preview
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawing) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const canvasPos = transform.point(pointer);
      updateMousePosition(canvasPos);
    },
    [isDrawing, updateMousePosition]
  );

  // Handle right-click to cancel
  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (isDrawing) {
        e.evt.preventDefault();
        cancelWire();
        e.cancelBubble = true;
      }
    },
    [isDrawing, cancelWire]
  );

  // Handle Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        cancelWire();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, cancelWire]);

  // Handle Delete key to remove selected wire
  const selectedWireId = useWiringStore((s) => s.selectedWireId);
  const removeWire = useProjectStore((s) => s.removeWire);
  const selectWire = useWiringStore((s) => s.selectWire);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWireId) {
        removeWire(selectedWireId);
        selectWire(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWireId, removeWire, selectWire]);

  // Always listen so wire mode clicks are captured; use cursor to indicate mode
  return (
    <Rect
      x={-50000}
      y={-50000}
      width={100000}
      height={100000}
      fill="transparent"
      listening={isDrawing || wiringMode}
      onClick={handleClick}
      onTap={handleClick}
      onMouseMove={handleMouseMove}
      onContextMenu={handleContextMenu}
    />
  );
}
