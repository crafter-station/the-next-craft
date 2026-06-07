type SectionHeaderProps = {
  /** Número de línea BASIC: "10", "20", … */
  line: string;
  /** Nombre de la sección, ej: "MANIFIESTO" */
  name: string;
};

/**
 * Apertura de sección como línea de BASIC del C64:
 * `10 PRINT "MANIFIESTO"` + regla lavanda.
 */
export function SectionHeader({ line, name }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4 border-b border-[var(--lav)]/40 pb-4">
      <p className="section-label">
        <span className="text-[var(--text-dim)]">{line} </span>
        PRINT &quot;{name}&quot;
      </p>
    </div>
  );
}
