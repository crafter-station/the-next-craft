"use client";

import { Suspense, useEffect, useState } from "react";

import { Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const MODEL_URL = "/c64.glb";

function C64() {
  const { scene } = useGLTF(MODEL_URL);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
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
 * C64Model — el Commodore 64 en 3D dentro del hero.
 * Auto-rotate lento + drag para girarlo (sin zoom ni pan).
 * Con prefers-reduced-motion el auto-rotate se apaga (drag sigue).
 * Decorativo: el wrapper lleva aria-hidden; el contenido real del
 * hero vive en el texto.
 */
export function C64Model() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className="w-full h-[300px] sm:h-[380px] lg:h-[440px] cursor-grab active:cursor-grabbing"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [7, 5, 11], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[6, 10, 6]} intensity={1.6} />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={0.5}
          color="#e9e7de"
        />
        <Suspense fallback={<LoadingFallback />}>
          <C64 />
        </Suspense>
        <OrbitControls
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.9}
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
