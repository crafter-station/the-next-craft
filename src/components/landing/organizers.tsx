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

import { CornerMarks } from "./corner-marks";

export function Organizers() {
  return (
    <section
      id="organizers"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--paper-dim)]"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        {/* Label + headline + subtext group */}
        <div className="flex flex-col gap-3">
          <p className="section-label">[08] — ORGANIZERS</p>
          <h2
            className="font-sans font-extrabold leading-none text-[var(--blue)]"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              marginLeft: "-0.02em",
            }}
          >
            La gente detrás del plano.
          </h2>
          <p
            className="font-sans text-[var(--ink-dim)] leading-[1.65] max-w-xl mt-1"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            El equipo de Crafter Station y Next que hace que las 36 horas
            funcionen.
          </p>
        </div>

        {/* Cards grid — gap-px + blue bg = shared 1px borders */}
        <ul
          className="grid grid-cols-2 md:grid-cols-3 gap-px bg-[var(--blue)] list-none m-0 p-0"
          aria-label="Equipo organizador"
        >
          {ORGANIZERS.map(
            ({ initials, name, role, handle, placeholder, accent }) => (
              <li
                key={`${role}-${handle}`}
                className="bg-[var(--paper-dim)] flex flex-col gap-0"
              >
                <div className="flex flex-col gap-5 px-6 pt-8 pb-8">
                  {/* Avatar tipográfico */}
                  <div
                    className={[
                      "w-16 h-16 border border-[var(--blue)] flex items-center justify-center select-none shrink-0",
                      accent ? "bg-[var(--blue)]" : "bg-[var(--paper-dim)]",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    <span
                      className={[
                        "font-sans font-black leading-none tracking-tight",
                        placeholder
                          ? "text-[var(--ink-dim)]"
                          : accent
                            ? "text-white"
                            : "text-[var(--blue)]",
                      ].join(" ")}
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)" }}
                    >
                      {initials}
                    </span>
                  </div>

                  {/* Name */}
                  <h3
                    className={[
                      "font-sans font-bold leading-tight tracking-tight",
                      placeholder
                        ? "text-[var(--ink-dim)]"
                        : "text-[var(--ink)]",
                    ].join(" ")}
                    style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
                  >
                    {name}
                  </h3>

                  {/* Role — mono uppercase blue */}
                  <p
                    className={[
                      "font-mono text-xs font-medium tracking-[0.15em] uppercase -mt-3",
                      placeholder
                        ? "text-[var(--ink-dim)]"
                        : "text-[var(--blue)]",
                    ].join(" ")}
                  >
                    {role}
                  </p>

                  {/* Handle — mono ink-dim */}
                  <p className="font-mono text-xs text-[var(--ink-dim)] -mt-2">
                    {handle}
                  </p>
                </div>
              </li>
            ),
          )}
        </ul>

        {/* Join CTA */}
        <p className="font-mono text-xs tracking-[0.05em] leading-[1.4] text-[var(--ink-dim)] border-t border-[var(--blue)] pt-4">
          {"¿Quieres ayudar a organizarlo? →"}{" "}
          <a
            href="mailto:hola@crafterstation.com"
            className="text-[var(--blue)] hover:text-[var(--blue-bright)] underline underline-offset-2 transition-colors duration-150"
          >
            escríbenos
          </a>
        </p>
      </div>
    </section>
  );
}
