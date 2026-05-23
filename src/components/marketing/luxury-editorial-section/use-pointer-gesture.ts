"use client";

import { useCallback, useRef } from "react";

type PointerGestureOptions = {
  onMove: (deltaX: number, deltaY: number) => void;
  onEnd?: () => void;
};

export function usePointerGesture({
  onMove,
  onEnd,
}: PointerGestureOptions) {
  const origin = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      origin.current = { x: event.clientX, y: event.clientY };
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!origin.current) {
        return;
      }

      const deltaX = event.clientX - origin.current.x;
      const deltaY = event.clientY - origin.current.y;

      origin.current = { x: event.clientX, y: event.clientY };
      onMove(deltaX, deltaY);
    },
    [onMove],
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!origin.current) {
        return;
      }

      origin.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      onEnd?.();
    },
    [onEnd],
  );

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerEnd,
    onPointerCancel: handlePointerEnd,
  };
}
