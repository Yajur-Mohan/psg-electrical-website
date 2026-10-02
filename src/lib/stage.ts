// Coordinates entrance animations with the intro preloader and page curtain,
// so hero reveals start exactly when the screen uncovers.

export const STAGE_READY = "psg:stage-ready";
export const INTRO_KEY = "psg-intro-seen";

// Inline <head> script: decides before first paint whether the intro plays, so
// returning visitors (and reduced-motion users) never see a flash of it.
export const introScript = `try{var m=matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.intro=(m||sessionStorage.getItem('${INTRO_KEY}'))?'done':'play'}catch(e){document.documentElement.dataset.intro='done'}`;

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
