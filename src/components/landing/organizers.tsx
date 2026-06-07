import { SectionHeader } from "./section-header";

const ORGANIZERS = [
  {
    initials: "SA",
    name: "Shiara Arauzo",
    role: "LEAD ORGANIZER",
    handle: "@shiarauzo",
    placeholder: false,
    accent: true,
  },
  {
    initials: "RH",
    name: "Railly Hugo",
    role: "CRAFTER STATION",
    handle: "@raillyhugo",
    placeholder: false,
    accent: false,
  },
  /* TODO: reemplazar con equipo real */
  {
    initials: "??",
    name: "Nombre Por Confirmar",
    role: "LOGISTICS",
    handle: "@tbd",
    placeholder: true,
    accent: false,
  },
  /* TODO: reemplazar con equipo real */
  {
    initials: "??",
    name: "Nombre Por Confirmar",
    role: "PARTNERSHIPS",
    handle: "@tbd",
    placeholder: true,
    accent: false,
  },
  /* TODO: reemplazar con equipo real */
  {
    initials: "??",
    name: "Nombre Por Confirmar",
    role: "COMMUNITY",
    handle: "@tbd",
    placeholder: true,
    accent: false,
  },
  /* TODO: reemplazar con equipo real */
  {
    initials: "??",
    name: "Nombre Por Confirmar",
    role: "DESIGN",
    handle: "@tbd",
    placeholder: true,
    accent: false,
  },
] as const;

export function Organizers() {
  return (
    <section
      id="organizers"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        {/* Label + headline + subtext group */}
        <div className="flex flex-col gap-6">
          <SectionHeader line="80" name="ORGANIZERS" />
          <h2
            className="pixel-heading"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
          >
            La gente detrás del teclado.
          </h2>
          <p
            className="font-sans text-[var(--text-dim)] leading-[1.65] max-w-xl -mt-2"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            El equipo de Crafter Station y Next que hace que las 36 horas
            funcionen.
          </p>
        </div>

        {/* Cards grid */}
        <ul
          className="grid grid-cols-2 md:grid-cols-3 gap-3 list-none m-0 p-0"
          aria-label="Equipo organizador"
        >
          {ORGANIZERS.map(
            ({ initials, name, role, handle, placeholder, accent }) => (
              <li
                key={`${role}-${handle}`}
                className="panel flex flex-col gap-0"
              >
                <div className="flex flex-col gap-5 px-6 pt-7 pb-7">
                  {/* Avatar pixel — sprite del equipo */}
                  <div
                    className={[
                      "w-14 h-14 border rounded-lg flex items-center justify-center select-none shrink-0",
                      accent
                        ? "bg-[var(--line)] border-[var(--bright)]"
                        : "bg-[var(--screen)] border-[var(--line)]/60",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <span
                      className={[
                        "font-pixel font-bold leading-none",
                        placeholder
                          ? "text-[var(--text-dim)]"
                          : "text-[var(--text)]",
                      ].join(" ")}
                      style={{ fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)" }}
                    >
                      {initials}
                    </span>
                  </div>

                  {/* Name */}
                  <h3
                    className={[
                      "font-sans font-semibold leading-tight",
                      placeholder
                        ? "text-[var(--text-dim)]"
                        : "text-[var(--text)]",
                    ].join(" ")}
                    style={{ fontSize: "clamp(0.9375rem, 1.4vw, 1.0625rem)" }}
                  >
                    {name}
                  </h3>

                  {/* Role */}
                  <p
                    className={[
                      "font-mono text-[10px] font-semibold tracking-[0.16em] uppercase -mt-3",
                      placeholder
                        ? "text-[var(--text-dim)]"
                        : "text-[var(--bright)]",
                    ].join(" ")}
                  >
                    {role}
                  </p>

                  {/* Handle */}
                  <p className="font-mono text-xs text-[var(--text-dim)] -mt-2">
                    {handle}
                  </p>
                </div>
              </li>
            ),
          )}
        </ul>

        {/* Join CTA */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.5] text-[var(--text-dim)]">
          {"¿Quieres ayudar a organizarlo? →"}{" "}
          <a
            href="mailto:hola@crafterstation.com"
            className="text-[var(--bright)] hover:text-[var(--text)] underline underline-offset-2 transition-colors duration-150"
          >
            escríbenos
          </a>
        </p>
      </div>
    </section>
  );
}
