type CornerMarksProps = {
  color?: string;
  opacity?: number;
};

/**
 * Marcas de registro "+" en las 4 esquinas de una sección.
 * El padre debe tener `position: relative` (clase `relative`).
 */
export function CornerMarks({ color, opacity }: CornerMarksProps) {
  const style =
    color !== undefined || opacity !== undefined
      ? { color, opacity }
      : undefined;

  return (
    <>
      <span className="corner corner-tl" aria-hidden="true" style={style} />
      <span className="corner corner-tr" aria-hidden="true" style={style} />
      <span className="corner corner-bl" aria-hidden="true" style={style} />
      <span className="corner corner-br" aria-hidden="true" style={style} />
    </>
  );
}
