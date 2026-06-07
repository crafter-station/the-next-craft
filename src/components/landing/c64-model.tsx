"use client";

import { Suspense } from "react";

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

/** Fallback temático mientras carga el .glb (~800KB, Draco) */
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
 * C64Model — el monitor Commodore 1702 en 3D dentro del hero.
 * Estático (sin auto-rotate); se puede girar con drag, sin zoom ni pan.
 * Decorativo: el wrapper lleva aria-hidden; el contenido real del
 * hero vive en el texto.
 */
export function C64Model() {
  return (
    <div
      className="w-full h-[420px] sm:h-[520px] lg:h-[620px] cursor-grab active:cursor-grabbing"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [3.4, 1.3, 7.6], fov: 32 }}
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
