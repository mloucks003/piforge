/**
 * Export the Konva canvas as a downloadable PNG.
 * Finds the Konva stage canvas element on the page and triggers a download.
 */
export function exportCanvasAsPng(filename = 'piforge-circuit.png'): boolean {
  const stageCanvas = document.querySelector(
    '.konvajs-content canvas',
  ) as HTMLCanvasElement | null;
  if (!stageCanvas) return false;

  try {
    const dataUrl = stageCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}
