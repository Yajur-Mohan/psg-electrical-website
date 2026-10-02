// Thin analytics wrapper. Fires GA4 (gtag) if present, and always emits a DOM
// event so the events can be checked in the console during the demo.

type Props = Record<string, string | number>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, props);
  window.dispatchEvent(new CustomEvent("psg:analytics", { detail: { event, ...props } }));
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props);
}
