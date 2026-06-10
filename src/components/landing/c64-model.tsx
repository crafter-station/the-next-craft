"use client";

import { Suspense, useRef } from "react";

import { Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

const MODEL_URL = "/c64.glb";

/*
  Posición del frente de la pantalla del monitor en coords del modelo
  ya centrado por <Center>: la pantalla (Object_19) está en el mundo en
  (0, 2.26, -0.35) y el centro de la escena en (-0.17, 1.9, -0.97).
*/
const SCREEN_POSITION: [number, number, number] = [0.0, 1.95, 0.65];

function C64({ parallax }: { parallax: boolean }) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<Group>(null);

  // Parallax sutil: el set inclina hacia el puntero (lerp suave). Compone
  // con el drag de OrbitControls (que mueve la cámara, no el objeto).
  useFrame((state) => {
    if (!parallax || !group.current) return;
    const targetY = state.pointer.x * 0.16;
    const targetX = -state.pointer.y * 0.07;
    group.current.rotation.y += (targetY - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (targetX - group.current.rotation.x) * 0.05;
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} />
        {/* Wordmark dentro de la pantalla del monitor */}
        <Html
          transform
          position={SCREEN_POSITION}
          distanceFactor={2.6}
          style={{ pointerEvents: "none" }}
          aria-hidden="true"
        >
          <p
            className="font-script font-bold text-[40px] leading-[1.4] text-[#26261f] whitespace-nowrap select-none"
            style={{ WebkitTextStroke: "0.9px #26261f" }}
          >
            the next craft
          </p>
        </Html>
      </Center>
    </group>
  );
}

/** Fallback temático mientras carga el .glb (~2MB, Draco) */
function LoadingFallback() {
  return (
    <Html center>
      <p className="font-mono text-sm text-[var(--bright)] whitespace-nowrap">
        LOAD &quot;C64&quot;,8,1 … LOADING
      </p>
    </Html>
  );
}

/**
 * C64Model — el set Commodore 64 completo (monitor, teclado, floppy,
 * joystick) visto DE FRENTE, con "the next craft" dentro de la pantalla.
 * Estático (sin auto-rotate); drag para girar, sin zoom ni pan.
 * Decorativo: el wrapper lleva aria-hidden; el h1 real es sr-only en Hero.
 */
export function C64Model() {
  const parallax = useRef(true);
  if (typeof window !== "undefined") {
    parallax.current = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
  }

  return (
    <div
      className="w-full h-[380px] sm:h-[460px] lg:h-[540px] cursor-grab active:cursor-grabbing"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.4, 12], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 10, 8]} intensity={1.6} />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={0.5}
          color="#e9e7de"
        />
        <Suspense fallback={<LoadingFallback />}>
          <C64 parallax={parallax.current} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
