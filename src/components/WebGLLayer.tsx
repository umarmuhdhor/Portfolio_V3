'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { DURATION, EASE_NAME, prefersReducedMotion, registerEase } from '@/lib/ease';
import { FRAGMENT_SHADER, VERTEX_SHADER } from '@/lib/shaders';

const BREAKPOINT = 767.99;

/* --------------------------------------------------------------------------
   Plate parallax

   The canvas takes the frame over from the DOM image, which means the CSS
   parallax in ScrollMotion is invisible wherever this layer is running — it
   animates an element at opacity 0. The same drift therefore has to happen
   again here, in texture space.

   RATE is the reference's: its hero plate translates at 0.20 of the scroll
   rate and its statement plate at 0.188. ZOOM is what buys the room to do it
   — a 16:9 photograph in a 16:9 frame has no slack at cover fit.
   -------------------------------------------------------------------------- */
const PARALLAX_ZOOM = 1.5;
const PARALLAX_RATE = 0.2;

/** Is there a usable WebGL context on this machine? */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The WebGL image layer.
 *
 * Every element marked `data-gl` keeps its `<img>` in the DOM and gets a plane
 * in a fixed full-viewport canvas positioned over it. The DOM image is what
 * ships and what search engines and screen readers see; the plane is an
 * enhancement drawn on top, and it is only ever swapped in once the texture has
 * actually loaded.
 *
 * It degrades in three cases, all of which leave the plain `<img>` in place:
 * no WebGL context, `prefers-reduced-motion`, and any viewport below the
 * breakpoint. The reference does the same — matching that is part of matching
 * the design, not a reduction in scope.
 */
export default function WebGLLayer() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const enabled = hasWebGL() && !prefersReducedMotion() && window.innerWidth >= BREAKPOINT;
    if (!enabled) return;

    registerEase();
    gsap.registerPlugin(Observer);

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-gl]'));
    if (!targets.length) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'wgl-canvas';
    wrap.appendChild(canvas);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      canvas.remove();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    // Orthographic in CSS-pixel units: one world unit is one screen pixel, so a
    // plane can be sized and placed straight from getBoundingClientRect with no
    // projection maths in between.
    const camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      -1000,
      1000
    );
    camera.position.z = 10;

    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    type Item = {
      el: HTMLElement;
      img: HTMLImageElement;
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      ready: boolean;
    };

    const items: Item[] = [];

    for (const el of targets) {
      const img = el.querySelector('img');
      if (!img) continue;

      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTexture: { value: null },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uImageSize: { value: new THREE.Vector2(1, 1) },
          uOffset: { value: new THREE.Vector2(0.5, 0.5) },
          uOpacity: { value: 0 },
          uBgOpacity: { value: 0 },
          uRadius: { value: 0 },
          uClip: { value: 0 },
          uFeather: { value: 0.004 },
          uNoise: { value: 1 },
          // Only parallax frames zoom; everything else samples its texture at
          // the plain cover fit, as before.
          uZoom: { value: el.hasAttribute('data-parallax') ? PARALLAX_ZOOM : 1 },
          uShift: { value: 0 },
          uTime: { value: 0 },
          uBgColor: { value: new THREE.Color('#f8f8f8') },
        },
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);

      const item: Item = { el, img, mesh, material, ready: false };
      items.push(item);

      loader.load(
        img.currentSrc || img.src,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;
          material.uniforms.uTexture.value = texture;
          material.uniforms.uImageSize.value.set(texture.image.width, texture.image.height);
          item.ready = true;

          // Only now is it safe to hand the frame over to the canvas.
          el.classList.add('is--gl');
          gsap.to(material.uniforms.uOpacity, { value: 1, duration: DURATION.image, ease: EASE_NAME });
          gsap.to(material.uniforms.uNoise, { value: 0, duration: DURATION.image, ease: EASE_NAME });
        },
        undefined,
        () => {
          // Texture failed — leave the DOM image visible and drop the plane.
          scene.remove(mesh);
          material.dispose();
        }
      );
    }

    // --- layout: plane follows its element ---------------------------------
    const layout = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      for (const item of items) {
        const r = item.el.getBoundingClientRect();
        item.mesh.scale.set(r.width, r.height, 1);
        // DOM y grows downward, world y grows upward.
        item.mesh.position.set(r.left + r.width / 2 - vw / 2, -(r.top + r.height / 2) + vh / 2, 0);
        item.material.uniforms.uResolution.value.set(r.width, r.height);
        item.material.uniforms.uRadius.value = 0;

        // Reveal from the bottom as the frame enters the viewport.
        const entering = gsap.utils.clamp(0, 1, (vh - r.top) / (vh * 0.35));
        item.material.uniforms.uClip.value = 1 - entering;

        // Plate drift. `progress` runs 0 to 1 as the frame crosses the
        // viewport, matching ScrollTrigger's top-bottom to bottom-top span,
        // so the canvas and the DOM fallback move through the same phase.
        if (item.material.uniforms.uZoom.value > 1) {
          const progress = gsap.utils.clamp(0, 1, (vh - r.top) / (vh + r.height));
          // Screen-space travel wanted, converted back into texture uv: the
          // plane shows `window` of the texture's height across r.height px.
          const window =
            Math.min(r.height / r.width / (item.material.uniforms.uImageSize.value.y / item.material.uniforms.uImageSize.value.x), 1) /
            PARALLAX_ZOOM;
          const travelPx = PARALLAX_RATE * (vh + r.height);
          const amplitude = (travelPx * window) / (2 * r.height);
          // Never let the sampled window walk off the texture.
          const limit = (1 - window) / 2;
          const a = Math.min(amplitude, limit);
          item.material.uniforms.uShift.value = (progress - 0.5) * 2 * a;
        }
      }
    };

    // --- pointer + velocity ------------------------------------------------
    let velocity = 0;
    const observer = Observer.create({
      type: 'wheel,touch,scroll',
      onChangeY: (self) => {
        velocity = gsap.utils.clamp(-1, 1, self.velocityY / 4000);
      },
    });

    const clock = new THREE.Clock();
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      layout();
      const t = clock.getElapsedTime();
      for (const item of items) {
        item.material.uniforms.uTime.value = t;
        // Velocity feathers the edges — the faster the scroll, the softer the
        // plane boundary, which reads as motion blur without costing a pass.
        item.material.uniforms.uFeather.value = 0.004 + Math.abs(velocity) * 0.02;
      }
      velocity *= 0.92;
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      renderer.setSize(vw, vh);
      camera.left = -vw / 2;
      camera.right = vw / 2;
      camera.top = vh / 2;
      camera.bottom = -vh / 2;
      camera.updateProjectionMatrix();

      // Dropping below the breakpoint hands every frame back to the DOM image.
      if (vw < BREAKPOINT) items.forEach((i) => i.el.classList.remove('is--gl'));
      else items.forEach((i) => i.ready && i.el.classList.add('is--gl'));
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      observer.kill();
      items.forEach((i) => {
        i.el.classList.remove('is--gl');
        i.material.uniforms.uTexture.value?.dispose?.();
        i.material.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div aria-hidden="true" className="wglw" ref={wrapRef} />;
}
