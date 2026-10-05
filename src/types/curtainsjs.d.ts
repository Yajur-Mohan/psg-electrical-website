// Minimal types for the parts of curtainsjs (v8) this site uses; the package ships none.
declare module "curtainsjs" {
  export class Curtains {
    constructor(params: { container: HTMLElement; pixelRatio?: number; watchScroll?: boolean; antialias?: boolean });
    onError(cb: () => void): this;
    onContextLost(cb: () => void): this;
    dispose(): void;
  }
  export class Plane {
    constructor(
      curtains: Curtains,
      element: HTMLElement,
      params: {
        vertexShader: string;
        fragmentShader: string;
        uniforms?: Record<string, { name: string; type: string; value: number | number[] }>;
        widthSegments?: number;
        heightSegments?: number;
      },
    );
    uniforms: Record<string, { value: number | number[] }>;
    onReady(cb: () => void): this;
    onRender(cb: () => void): this;
    getBoundingRect(): { left: number; top: number; width: number; height: number };
    resize(): void;
    remove(): void;
  }
}
