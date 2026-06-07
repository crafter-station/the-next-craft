/**
 * BlueprintRuler — regla vertical fija al margen izquierdo de la página.
 * Desktop únicamente (oculta en mobile via CSS). CSS-only rendering.
 * Cada tick = 96px (2 módulos del grid blueprint de 48px).
 * ~20 ticks cubren páginas de ~1920px de alto.
 */

const TICK_COUNT = 22;

export function BlueprintRuler() {
  return (
    <div className="blueprint-ruler" aria-hidden="true">
      <div className="blueprint-ruler__ticks">
        {Array.from({ length: TICK_COUNT }, (_, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static decorative list
            key={i}
            className="blueprint-ruler__tick"
          >
            <span>{String(i * 96).padStart(4, "0")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
