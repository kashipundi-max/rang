let cachedSupport: boolean | null = null;

/**
 * Probe whether a WebGL context can actually be created in this browser.
 * ogl's `new Renderer()` throws synchronously when context creation fails
 * (blocklisted GPU, headless/emulated env, or the per-page context limit is
 * hit), which would otherwise take down the whole client bundle.
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedSupport !== null) return cachedSupport;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    cachedSupport = Boolean(gl);
    const loseContext =
      gl && (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    loseContext?.loseContext?.();
  } catch {
    cachedSupport = false;
  }

  return cachedSupport;
}
