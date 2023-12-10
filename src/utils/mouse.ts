import { Vec2 } from "./math";

export const mouseState = {
  center: [0, 0],
};

let previousMouseCoords = [0, 0];

export const initMouseEvents = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return;

  const onMouseMove = (event: MouseEvent) => {
    const target = event.target as HTMLCanvasElement;
    if (!target) return;

    // Convert mouse position to normalized device coordinates
    const rect = target.getBoundingClientRect();
    const mouseX = (event.clientX / rect.width) * 2 - 1;
    const mouseY = -(event.clientY / rect.height) * 2 + 1;

    // Update mouse state
    mouseState.center = [mouseX, mouseY];

    // Update previous mouse position
    previousMouseCoords = mouseState.center;
  };

  canvas.addEventListener("mousemove", onMouseMove, false);
};
