"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { Renderer, Program, Mesh, Geometry, Transform } from "ogl";

// Generate scatter points data - positions in normalized 0-1 range
const generateScatterPoints = (count: number) => {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // X: full width distribution (0 to 1)
    positions[i * 3] = Math.random();
    // Y: distribute from above bars (~25% from bottom) to top
    // In the blue chart, dots start around y=12 level (which is ~25% from bottom)
    // and go up to the top of the chart
    positions[i * 3 + 1] = 0.25 + Math.random() * 0.75;
    positions[i * 3 + 2] = 0;

    sizes[i] = 2 + Math.random() * 2;
    opacities[i] = 0.4 + Math.random() * 0.6;
  }

  return { positions, sizes, opacities };
};

const VERTEX_SHADER = `
  attribute vec3 position;
  attribute float size;
  attribute float opacity;
  
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  
  varying float vOpacity;
  
  void main() {
    vOpacity = opacity;
    
    // Convert from 0-1 to clip space -1 to 1
    vec2 clipPos = position.xy * 2.0 - 1.0;
    
    gl_Position = vec4(clipPos, 0.0, 1.0);
    gl_PointSize = size * uPixelRatio;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  
  uniform vec3 uColor;
  varying float vOpacity;
  
  void main() {
    // Create circular point
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Discard pixels outside circle
    if (dist > 0.5) discard;
    
    // Smooth circle edge
    float alpha = 1.0 - smoothstep(0.35, 0.5, dist);
    alpha *= vOpacity;
    
    // Add glow effect
    float glow = 1.0 - smoothstep(0.0, 0.5, dist);
    vec3 finalColor = uColor * (1.0 + glow * 0.5);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface ScatterDotsWebGLProps {
  pointCount?: number;
}

export function ScatterDotsWebGL({ pointCount = 200 }: ScatterDotsWebGLProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Memoize scatter points to avoid regenerating on each render
  const scatterData = useMemo(
    () => generateScatterPoints(pointCount),
    [pointCount]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Wait for container to have dimensions
    const initWebGL = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      if (width === 0 || height === 0) {
        // Retry after a short delay
        requestAnimationFrame(initWebGL);
        return;
      }

      // Create renderer
      const renderer = new Renderer({
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
        dpr: Math.min(window.devicePixelRatio, 2),
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // Style canvas
      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      container.appendChild(canvas);

      // Set size - use actual pixel dimensions
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Get brand color from CSS variable
      const computedStyle = getComputedStyle(document.documentElement);
      const brandColor =
        computedStyle.getPropertyValue("--color-brand-primary-light").trim() ||
        "#4ade80";

      // Parse color to RGB
      const parseColor = (color: string): [number, number, number] => {
        if (color.startsWith("#")) {
          const hex = color.slice(1);
          const r = parseInt(hex.slice(0, 2), 16) / 255;
          const g = parseInt(hex.slice(2, 4), 16) / 255;
          const b = parseInt(hex.slice(4, 6), 16) / 255;
          return [r, g, b];
        }
        // Try rgb() format
        const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          return [
            parseInt(rgbMatch[1]) / 255,
            parseInt(rgbMatch[2]) / 255,
            parseInt(rgbMatch[3]) / 255,
          ];
        }
        return [0.29, 0.87, 0.5]; // fallback green
      };

      const [r, g, b] = parseColor(brandColor);

      // Create geometry with scatter points
      const geometry = new Geometry(gl, {
        position: { size: 3, data: scatterData.positions },
        size: { size: 1, data: scatterData.sizes },
        opacity: { size: 1, data: scatterData.opacities },
      });

      // Create shader program
      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: [r, g, b] },
          uResolution: { value: [width, height] },
          uPixelRatio: { value: dpr },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      // Create mesh
      const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      // Create scene
      const scene = new Transform();
      mesh.setParent(scene);

      // Render function
      const render = () => {
        renderer.render({ scene });
      };

      render();

      // Handle resize
      const handleResize = () => {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;
        if (newWidth > 0 && newHeight > 0) {
          canvas.width = newWidth * dpr;
          canvas.height = newHeight * dpr;
          gl.viewport(0, 0, canvas.width, canvas.height);
          program.uniforms.uResolution.value = [newWidth, newHeight];
          render();
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Store cleanup function
      cleanupRef.current = () => {
        resizeObserver.disconnect();
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      };
    };

    initWebGL();

    // Cleanup
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [scatterData]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-8 right-4 pointer-events-none"
      style={{ zIndex: 1, bottom: "30px" }}
    />
  );
}
