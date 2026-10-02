// Coordinates entrance animations with the intro preloader and page curtain,
// so hero reveals start exactly when the screen uncovers.

export const STAGE_READY = "psg:stage-ready";

export function isStageBusy() {
  const d = document.documentElement.dataset;
  return d.intro === "play" || d.transitioning === "true";
}

export function whenStageReady(cb: () => void): () => void {
  if (!isStageBusy()) {
    cb();
    return () => {};
  }
  const handler = () => {
    if (isStageBusy()) return;
    window.removeEventListener(STAGE_READY, handler);
    cb();
  };
  window.addEventListener(STAGE_READY, handler);
  return () => window.removeEventListener(STAGE_READY, handler);
}

export function announceStageReady() {
  window.dispatchEvent(new Event(STAGE_READY));
}
