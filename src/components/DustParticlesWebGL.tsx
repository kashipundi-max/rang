"use client";

import React, { useRef, useEffect, useState } from "react";
import { Renderer, Program, Mesh, Geometry } from "ogl";
import { isWebGLAvailable } from "@/lib/webgl";

// Reduced particle count for better performance
const PARTICLE_COUNT = 10;

// Store particle state for CPU-side animation (matching original behavior)
interface Particle {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  size: number; // 1-4 px
  speed: number; // 0.1-0.36 per frame (reduced max by 40%)
  opacity: number; // 0.2-0.8
  drift: number; // -0.15 to 0.15 per frame
  id: number;
}

const VERTEX_SHADER = `
  attribute vec3 position;
  attribute float aSize;
  attribute float aOpacity;
  
  uniform float uPixelRatio;
  
  varying float vOpacity;
  
  void main() {
    vOpacity = aOpacity;
    
    // Position is already in clip space (-1 to 1)
    gl_Position = vec4(position.xy, 0.0, 1.0);
    
    // Size with blur effect (original: size * 1.5 to account for blur)
    gl_PointSize = aSize * uPixelRatio * 1.5;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  
  varying float vOpacity;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    // Soft circular particle with blur effect
    float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
    
    // Apply opacity
    alpha *= vOpacity;
    
    // White color
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

interface DustParticlesWebGLProps {
  enabled: boolean;
}

export default function DustParticlesWebGL({
  enabled,
}: DustParticlesWebGLProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!enabled || !isMounted || !containerRef.current) {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      return;
    }

    const container = containerRef.current;

    if (!isWebGLAvailable()) return;

    const initWebGL = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      if (width === 0 || height === 0) {
        requestAnimationFrame(initWebGL);
        return;
      }

      // Initialize particles with reduced count and speed
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1, // 1-4px
        speed: Math.random() * 0.26 + 0.1, // 0.1-0.36 (max reduced by 40%)
        opacity: Math.random() * 0.6 + 0.2, // 0.2-0.8
        drift: Math.random() * 0.3 - 0.15, // -0.15 to 0.15
      }));

      let renderer: Renderer;
      try {
        renderer = new Renderer({
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
          dpr: Math.min(window.devicePixelRatio, 2),
        });
      } catch {
        // Context creation can still fail here even after the probe passed
        // (e.g. the per-page WebGL context limit is reached). Bail quietly
        // instead of letting ogl's throw crash the app.
        return;
      }

      const gl = renderer.gl;
      if (!gl) return;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      container.appendChild(canvas);

      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Create buffers
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const sizes = new Float32Array(PARTICLE_COUNT);
      const opacities = new Float32Array(PARTICLE_COUNT);

      const geometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        aSize: { size: 1, data: sizes },
        aOpacity: { size: 1, data: opacities },
      });

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uPixelRatio: { value: dpr },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      // Create mesh - pass it directly as scene (no Transform needed for 2D)
      const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      let animationId: number;

      const updateParticles = () => {
        const particles = particlesRef.current;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Update position (matching original per-frame update)
          p.y -= p.speed;
          p.x += p.drift;

          // Fluctuate opacity (matching original: ±0.05 random per frame)
          p.opacity += (Math.random() - 0.5) * 0.1;
          p.opacity = Math.max(0.1, Math.min(0.8, p.opacity));

          // Respawn if out of bounds
          if (p.y < -5 || p.x < -10 || p.x > 110) {
            p.x = Math.random() * 100;
            p.y = 105 + Math.random() * 10;
            p.size = Math.random() * 3 + 1;
            p.speed = Math.random() * 0.26 + 0.1; // 0.1-0.36 (max reduced by 40%)
            p.opacity = Math.random() * 0.6 + 0.2;
            p.drift = Math.random() * 0.3 - 0.15;
          }

          // Convert percentage to clip space (-1 to 1)
          // x: 0-100% -> -1 to 1
          // y: 0-100% -> 1 to -1 (flipped because WebGL y is up)
          positions[i * 3] = (p.x / 100) * 2 - 1;
          positions[i * 3 + 1] = 1 - (p.y / 100) * 2;
          positions[i * 3 + 2] = 0;

          sizes[i] = p.size;
          opacities[i] = p.opacity;
        }

        // Update geometry buffers directly
        const posAttr = geometry.attributes.position;
        const sizeAttr = geometry.attributes.aSize;
        const opacityAttr = geometry.attributes.aOpacity;

        if (posAttr.buffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, posAttr.buffer);
          gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
        }
        if (sizeAttr.buffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, sizeAttr.buffer);
          gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
        }
        if (opacityAttr.buffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, opacityAttr.buffer);
          gl.bufferData(gl.ARRAY_BUFFER, opacities, gl.DYNAMIC_DRAW);
        }
      };

      const render = () => {
        updateParticles();

        // Clear and render directly (same pattern as DottedPatternWebGL)
        gl.clear(gl.COLOR_BUFFER_BIT);
        mesh.program.use();
        mesh.geometry.draw({ mode: gl.POINTS, program: mesh.program });

        animationId = requestAnimationFrame(render);
      };

      render();

      const handleResize = () => {
        const newWidth = container.offsetWidth;
        const newHeight = container.offsetHeight;
        if (newWidth > 0 && newHeight > 0) {
          canvas.width = newWidth * dpr;
          canvas.height = newHeight * dpr;
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      cleanupRef.current = () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      };
    };

    initWebGL();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [enabled, isMounted]);

  // Always render the container div to maintain consistent component tree for hydration
  return (
    <div
      ref={containerRef}
      className="max-w-[600px] mx-auto absolute inset-0 pointer-events-none z-20 transition-opacity duration-700"
      style={{ display: enabled ? undefined : "none" }}
    />
  );
}
