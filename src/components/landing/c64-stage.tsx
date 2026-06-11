"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { Center, Html, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box3, type Group, Vector3 } from "three";

const MODEL_URL = "/c64.glb";
const CAM_Z = 12;
const FOV = 35;

/*
  Posición del frente de la pantalla del monitor en coords del modelo
  ya centrado por <Center> (heredado de c64-model).
*/
const SCREEN_POSITION: [number, number, number] = [0.0, 1.95, 0.65];

/*
  C64Stage — la computadora vive en UN solo canvas fijo a pantalla completa
  y VIAJA entre secciones: cada sección declara un <div data-c64-anchor="…">
  y el modelo vuela hasta estacionarse sobre él, girando en el trayecto.

  Algoritmo por frame:
  1. Se elige el segmento [i, j]: i = último anchor cuyo centro (en coords de
     documento) quedó por encima del centro del viewport.
  2. e = qué tan cerca está el anchor j de llegar al centro del viewport
     (smoothstep sobre su último viewport de aproximación). Mientras j está
     lejos, e=0 → el modelo queda pegado a i y se va con su sección al
     scrollear; cuando j se acerca, e→1 y el modelo vuela hacia él.
  3. Lerp en pantalla (px) → proyección a coords de mundo del plano z=0.
     La escala sale de la altura del anchor (modelo normalizado a altura 1).
  4. Damping (lerp 0.1) para que el vuelo se sienta físico aun con scroll
     brusco. Spin extra sin(e·π) durante el trayecto.

  Reduced-motion: el modelo queda anclado SOLO al anchor del hero (se
  comporta como una imagen estática que scrollea con la página).
*/

type Pose = { rx: number; ry: number; spin: number };

/*
  Hoy la compu vive solo en el hero (un único anchor): se queda quieta ahí
  y scrollea con la página. Si mañana se quiere que viaje de nuevo, basta
  con declarar más <div data-c64-anchor="…"> y su pose aquí.
*/
const POSES: Record<string, Pose> = {
  hero: { rx: 0, ry: 0, spin: 0 },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/*
  El set es muy profundo (~10.5u): el frente del teclado queda mucho más
  cerca de la cámara y la perspectiva lo agranda. Este factor compensa
  para que el modelo quede contenido en su anchor.
*/
const PERSPECTIVE_COMFORT = 0.74;

function Traveler({ reduced }: { reduced: boolean }) {
  const { scene } = useGLTF(MODEL_URL);
  const outer = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const modelSize = useRef({ w: 1, h: 1 });
  const anchors = useRef<{ el: HTMLElement; pose: Pose }[]>([]);
  const pointer = useRef({ x: 0, y: 0 });

  // Tamaño natural del modelo → normalizamos la escala contra él
  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    modelSize.current = { w: size.x || 1, h: size.y || 1 };
  }, [scene]);

  // Los anchors viven en el DOM de las secciones (server components)
  useEffect(() => {
    anchors.current = Array.from(
      document.querySelectorAll<HTMLElement>("[data-c64-anchor]"),
    ).map((el) => ({
      el,
      pose: POSES[el.dataset.c64Anchor ?? ""] ?? POSES.hero,
    }));
  }, []);

  // Parallax con el puntero (el canvas tiene pointer-events: none,
  // así que escuchamos en window)
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useFrame(() => {
    if (!outer.current || !spin.current) return;
    // Solo anchors visibles (los laterales se ocultan en mobile)
    const list = anchors.current.filter((a) => a.el.offsetParent !== null);
    if (list.length === 0) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rects = list.map((a) => a.el.getBoundingClientRect());

    let i = 0;
    let e = 0;
    if (reduced || list.length === 1) {
      i = 0;
    } else {
      const sy = window.scrollY;
      const centers = rects.map((r) => r.top + sy + r.height / 2);
      const probe = sy + vh / 2;
      while (i < centers.length - 2 && probe > centers[i + 1]) i++;
      const j = i + 1;
      // e: el anchor j "atrae" al modelo durante su último medio viewport
      // (ventana corta → se acopla rápido y no flota sobre el contenido)
      const approach = rects[j].top + rects[j].height / 2 - vh / 2;
      e = smooth(clamp01(1 - approach / (vh * 0.55)));
    }
    const j = Math.min(i + 1, list.length - 1);

    // Target en pantalla → mundo (plano z=0 de la cámara en [0,0,CAM_Z])
    const cx = lerp(
      rects[i].left + rects[i].width / 2,
      rects[j].left + rects[j].width / 2,
      e,
    );
    const cy = lerp(
      rects[i].top + rects[i].height / 2,
      rects[j].top + rects[j].height / 2,
      e,
    );
    const hpx = lerp(rects[i].height, rects[j].height, e);
    const wpx = lerp(rects[i].width, rects[j].width, e);

    const visH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360);
    const visW = visH * (vw / vh);
    const tx = (cx / vw - 0.5) * visW;
    const ty = (0.5 - cy / vh) * visH;
    // Que el modelo QUEPA en el anchor: limita por alto y por ancho
    const fitH = ((hpx / vh) * visH) / modelSize.current.h;
    const fitW = ((wpx / vw) * visW) / modelSize.current.w;
    const targetScale = Math.min(fitH, fitW) * PERSPECTIVE_COMFORT;

    const pi = list[i].pose;
    const pj = list[j].pose;
    let ry = lerp(pi.ry, pj.ry, e);
    let rx = lerp(pi.rx, pj.rx, e);
    if (!reduced) {
      // Vuelta extra durante el trayecto + parallax del puntero
      ry += Math.sin(e * Math.PI) * 1.05 * pj.spin;
      ry += pointer.current.x * 0.12;
      rx += pointer.current.y * 0.06;
    }

    const k = reduced ? 1 : 0.1;
    outer.current.position.x += (tx - outer.current.position.x) * k;
    outer.current.position.y += (ty - outer.current.position.y) * k;
    const s = outer.current.scale.x + (targetScale - outer.current.scale.x) * k;
    outer.current.scale.setScalar(s);
    spin.current.rotation.y += (ry - spin.current.rotation.y) * k;
    spin.current.rotation.x += (rx - spin.current.rotation.x) * k;
  });

  return (
    <group ref={outer}>
      <group ref={spin}>
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
    </group>
  );
}

export function C64Stage() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="c64-stage" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, CAM_Z], fov: FOV }}
        gl={{ antialias: true, alpha: true }}
        // CRÍTICO: r3f pone pointer-events:auto en su wrapper interno;
        // sin esto el canvas fijo bloquea los clicks de TODA la página.
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 10, 8]} intensity={1.6} />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={0.5}
          color="#e9e7de"
        />
        <Suspense fallback={null}>
          <Traveler reduced={reduced} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
