// Thin gradient bar under the header that fills as you scroll (driven by
// --scroll-progress from SmoothScroll; static at 0 under reduced motion).
export default function ScrollProgress() {
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className="scroll-progress bg-gradient-brand h-full w-full shadow-[0_0_12px_rgba(123,69,245,.8)]" />
    </div>
  );
}
