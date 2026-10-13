"use client";

import React, { useRef, useEffect, useState } from "react";
import { Renderer, Program, Mesh, Geometry } from "ogl";
import { isWebGLAvailable } from "@/lib/webgl";

const VERTEX_SHADER = `
  attribute vec2 position;
  attribute vec2 uv;
  
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment shader that creates a realistic glass sphere with swirling liquid effect
const FRAGMENT_SHADER = `
  precision highp float;
  
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uBaseColor;      // Deep blue
  uniform vec3 uHighlightColor; // Light blue/white
  uniform vec3 uAccentColor;    // Mid blue
  
  varying vec2 vUv;
  
  #define PI 3.14159265359
  #define TAU 6.28318530718
  
  // Noise functions for organic swirls
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  // Swirl distortion
  vec2 swirl(vec2 uv, vec2 center, float angle, float radius) {
    vec2 delta = uv - center;
    float dist = length(delta);
    float falloff = 1.0 - smoothstep(0.0, radius, dist);
    float theta = atan(delta.y, delta.x);
    theta += angle * falloff * falloff;
    return center + vec2(cos(theta), sin(theta)) * dist;
  }
  
  // Sphere mapping - ray-sphere intersection
  vec3 sphereNormal(vec2 uv) {
    vec2 p = uv * 2.0 - 1.0;
    float r2 = dot(p, p);
    if (r2 > 1.0) return vec3(0.0);
    float z = sqrt(1.0 - r2);
    return normalize(vec3(p, z));
  }
  
  // Fresnel effect for glass
  float fresnel(vec3 normal, vec3 viewDir, float power) {
    return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
  }
  
  // Environment reflection (fake)
  vec3 envReflection(vec3 reflectDir, float roughness) {
    float y = reflectDir.y * 0.5 + 0.5;
    vec3 sky = mix(uAccentColor, uHighlightColor, y);
    return sky * (1.0 - roughness * 0.5);
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    
    // Center and scale to fit sphere
    vec2 centeredUv = (uv - 0.5) * aspect + 0.5;
    vec2 sphereUv = (centeredUv - 0.5) * 2.2 + 0.5; // Scale to fill
    
    // Get sphere normal
    vec3 normal = sphereNormal(sphereUv);
    
    // Outside sphere - transparent
    if (length(normal) < 0.01) {
      gl_FragColor = vec4(0.0);
      return;
    }
    
    // View direction (looking at screen)
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    
    // Reflection direction
    vec3 reflectDir = reflect(-viewDir, normal);
    
    // UV on sphere surface for texturing
    vec2 surfaceUv = sphereUv;
    
    // Slow rotation animation
    float rotationSpeed = 0.05;
    float rotation = uTime * rotationSpeed;
    
    // Apply multiple swirl centers for complex pattern
    vec2 swirl1Center = vec2(0.4, 0.5);
    vec2 swirl2Center = vec2(0.6, 0.4);
    vec2 swirl3Center = vec2(0.5, 0.6);
    
    // Animate swirl positions slightly
    swirl1Center += vec2(sin(uTime * 0.1), cos(uTime * 0.08)) * 0.05;
    swirl2Center += vec2(cos(uTime * 0.12), sin(uTime * 0.1)) * 0.04;
    
    // Apply swirls
    vec2 swirlUv = surfaceUv;
    swirlUv = swirl(swirlUv, swirl1Center, 3.0 + sin(uTime * 0.1) * 0.5, 0.6);
    swirlUv = swirl(swirlUv, swirl2Center, -2.5 + cos(uTime * 0.08) * 0.3, 0.5);
    swirlUv = swirl(swirlUv, swirl3Center, 2.0, 0.4);
    
    // Add rotation to create flowing effect
    vec2 rotCenter = vec2(0.5);
    vec2 rotDelta = swirlUv - rotCenter;
    float angle = atan(rotDelta.y, rotDelta.x) + rotation;
    float dist = length(rotDelta);
    swirlUv = rotCenter + vec2(cos(angle), sin(angle)) * dist;
    
    // Create layered noise patterns for liquid swirls
    float noiseScale = 4.0;
    float n1 = fbm(swirlUv * noiseScale + uTime * 0.02);
    float n2 = fbm(swirlUv * noiseScale * 1.5 - uTime * 0.015 + 100.0);
    float n3 = fbm(swirlUv * noiseScale * 0.8 + vec2(uTime * 0.01, -uTime * 0.02));
    
    // Combine noise layers
    float swirlyNoise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    
    // Create streaky patterns
    float streaks = sin(swirlUv.x * 20.0 + swirlyNoise * 10.0) * 0.5 + 0.5;
    streaks *= sin(swirlUv.y * 15.0 + swirlyNoise * 8.0) * 0.5 + 0.5;
    
    // Angular streaks for swirl arms
    vec2 fromCenter = swirlUv - vec2(0.5);
    float angularPos = atan(fromCenter.y, fromCenter.x);
    float radialDist = length(fromCenter);
    float spiralPattern = sin(angularPos * 3.0 + radialDist * 15.0 - uTime * 0.3) * 0.5 + 0.5;
    
    // Combine patterns
    float pattern = mix(swirlyNoise, spiralPattern, 0.4);
    pattern = mix(pattern, streaks, 0.2);
    
    // Color mixing based on pattern
    vec3 deepBlue = uBaseColor;
    vec3 midBlue = uAccentColor;
    vec3 lightBlue = uHighlightColor;
    
    // Layer colors
    vec3 color = deepBlue;
    color = mix(color, midBlue, smoothstep(0.3, 0.6, pattern));
    color = mix(color, lightBlue, smoothstep(0.7, 0.95, pattern) * 0.7);
    
    // Add white highlights in swirl peaks
    float highlights = smoothstep(0.85, 1.0, pattern + n1 * 0.2);
    color = mix(color, vec3(0.9, 0.95, 1.0), highlights * 0.6);
    
    // Fresnel for glass rim lighting
    float fres = fresnel(normal, viewDir, 3.0);
    
    // Environment reflection
    vec3 envColor = envReflection(reflectDir, 0.3);
    color = mix(color, envColor, fres * 0.4);
    
    // Specular highlights
    vec3 lightDir1 = normalize(vec3(0.5, 0.8, 1.0));
    vec3 lightDir2 = normalize(vec3(-0.6, 0.3, 0.8));
    
    float spec1 = pow(max(dot(reflectDir, lightDir1), 0.0), 60.0);
    float spec2 = pow(max(dot(reflectDir, lightDir2), 0.0), 40.0);
    
    color += vec3(1.0) * spec1 * 0.8;
    color += lightBlue * spec2 * 0.4;
    
    // Rim light for glass effect
    color += lightBlue * fres * 0.3;
    
    // Add subtle dark edges in swirl valleys
    float valleys = 1.0 - smoothstep(0.2, 0.5, pattern);
    color = mix(color, deepBlue * 0.5, valleys * 0.3);
    
    // Glass-like depth variation
    float depth = 1.0 - normal.z * 0.3;
    color *= depth;
    
    // Subtle color variation based on position
    color += uAccentColor * (1.0 - radialDist) * 0.1;
    
    // Edge softness for antialiasing
    float edge = 1.0 - smoothstep(0.95, 1.0, length((sphereUv - 0.5) * 2.0));
    
    // Final alpha based on sphere mask
    float alpha = edge;
    
    // Tone mapping and gamma
    color = color / (color + vec3(1.0)); // Simple Reinhard
    color = pow(color, vec3(1.0 / 2.2)); // Gamma correction
    
    gl_FragColor = vec4(color, alpha);
  }
`;

interface GlassSphereWebGLProps {
  className?: string;
  animate?: boolean;
}

export default function GlassSphereWebGL({
  className = "",
  animate = true,
}: GlassSphereWebGLProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    const container = containerRef.current;

    if (!isWebGLAvailable()) return;

    const initWebGL = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      if (width === 0 || height === 0) {
        requestAnimationFrame(initWebGL);
        return;
      }

      let renderer: Renderer;
      try {
        renderer = new Renderer({
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
          dpr: Math.min(window.devicePixelRatio, 1.5),
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

      // Full screen triangle (more efficient than quad)
      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
      });

      // Blue color palette matching the reference image
      const baseColor = [0.05, 0.1, 0.25]; // Deep navy blue
      const highlightColor = [0.7, 0.85, 1.0]; // Light sky blue
      const accentColor = [0.2, 0.4, 0.7]; // Mid blue

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uResolution: { value: [canvas.width, canvas.height] },
          uTime: { value: 0 },
          uBaseColor: { value: baseColor },
          uHighlightColor: { value: highlightColor },
          uAccentColor: { value: accentColor },
        },
        transparent: true,
        depthTest: false,
      });

      const mesh = new Mesh(gl, { geometry, program });

      let animationId: number;
      const startTime = performance.now();

      const render = () => {
        if (animate) {
          const elapsed = (performance.now() - startTime) / 1000;
          program.uniforms.uTime.value = elapsed;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);
        mesh.program.use();
        mesh.geometry.draw({ mode: gl.TRIANGLES, program: mesh.program });

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
          program.uniforms.uResolution.value = [canvas.width, canvas.height];
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
  }, [isMounted, animate]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`} />
  );
}
