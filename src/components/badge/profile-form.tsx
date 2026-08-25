"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";

import type { PublicParticipantProfile } from "@/lib/badge/profile";
import type { ParticipantProfileLink } from "@/lib/db/schema";

export type ProfileFormValue = {
  fullName: string;
  vehiclePlate: string;
  displayName: string;
  bio: string;
  links: ParticipantProfileLink[];
  documentType?: "dni" | "passport" | "ce";
  documentNumber?: string;
  acceptsTerms?: boolean;
};

type Props = {
  locale: "es" | "en";
  fullName: string | null;
  vehiclePlate: string | null;
  profile?: PublicParticipantProfile;
  pending: boolean;
  onCancel?: () => void;
  onSubmit: (value: ProfileFormValue) => void;
};

type EditableLink = ParticipantProfileLink & { key: string };

const copy = {
  es: {
    publicTitle: "Perfil publico",
    publicHelp:
      "Tu nombre publico, bio y enlaces apareceran en tu badge y perfil. Tu nombre completo nunca se mostrara aqui.",
    displayName: "Nombre publico",
    displayPlaceholder: "Como quieres que te conozcan",
    bio: "Bio",
    bioPlaceholder: "Que construyes, que buscas o en que puedes ayudar...",
    links: "Enlaces",
    addLink: "+ Agregar enlace",
    linkLabel: "Etiqueta",
    linkUrl: "https://...",
    remove: "Quitar",
    privateTitle: "Datos privados de acreditacion",
    privateHelp:
      "Solo los organizadores usan estos datos para la logistica del evento.",
    fullName: "Nombre completo legal",
    documentType: "Tipo de documento",
    document: "Numero de documento",
    documentEditHelp: "Dejalo en blanco para conservar el numero actual.",
    vehiclePlate: "Placa del vehiculo",
    vehiclePlateHelp: "Solo si vienes al evento en auto.",
    terms: "Acepto los terminos y condiciones del hackathon.",
    saveInitial: "Guardar y continuar",
    saveEdit: "Guardar cambios",
    cancel: "Cancelar",
  },
  en: {
    publicTitle: "Public profile",
    publicHelp:
      "Your public name, bio, and links appear on your badge and profile. Your full name is never shown there.",
    displayName: "Public name",
    displayPlaceholder: "How you want people to know you",
    bio: "Bio",
    bioPlaceholder: "What you build, what you need, or how you can help...",
    links: "Links",
    addLink: "+ Add link",
    linkLabel: "Label",
    linkUrl: "https://...",
    remove: "Remove",
    privateTitle: "Private accreditation details",
    privateHelp: "Only event organizers use these details for logistics.",
    fullName: "Full legal name",
    documentType: "Document type",
    document: "Document number",
    documentEditHelp: "Leave blank to keep your current number.",
    vehiclePlate: "Vehicle license plate",
    vehiclePlateHelp: "Only if you are driving to the event.",
    terms: "I accept the hackathon terms and conditions.",
    saveInitial: "Save and continue",
    saveEdit: "Save changes",
    cancel: "Cancel",
  },
} as const;

export function ProfileForm({
  locale,
  fullName,
  vehiclePlate,
  profile,
  pending,
  onCancel,
  onSubmit,
}: Props) {
  const t = copy[locale];
  const editing = Boolean(profile);
  const nextLinkId = useRef(profile?.links.length ?? 0);
  const [links, setLinks] = useState<EditableLink[]>(
    () =>
      profile?.links.map((link, index) => ({
        ...link,
        key: `saved-${index}`,
      })) ?? [],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const documentType = form.get("documentType");
    onSubmit({
      fullName: String(form.get("fullName") ?? ""),
      vehiclePlate: String(form.get("vehiclePlate") ?? "")
        .trim()
        .toUpperCase(),
      displayName: String(form.get("displayName") ?? ""),
      bio: String(form.get("bio") ?? ""),
      links: links.map(({ label, url }) => ({ label, url })),
      documentType:
        documentType === "dni" ||
        documentType === "passport" ||
        documentType === "ce"
          ? documentType
          : undefined,
      documentNumber:
        String(form.get("documentNumber") ?? "").trim() || undefined,
      acceptsTerms: editing ? undefined : form.get("acceptsTerms") === "on",
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-5">
        <div>
          <p className="section-label">PUBLIC</p>
          <h2 className="mt-3 font-pixel text-2xl uppercase">
            {t.publicTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">
            {t.publicHelp}
          </p>
        </div>
        <label className="block">
          <span className="text-sm text-[var(--text-dim)]">
            {t.displayName}
          </span>
          <input
            name="displayName"
            required
            minLength={2}
            maxLength={32}
            defaultValue={profile?.displayName ?? ""}
            placeholder={t.displayPlaceholder}
            autoComplete="nickname"
            className="mt-2 h-12 w-full border border-[var(--line)] bg-[var(--void)] px-4 outline-none focus:border-[var(--bright)]"
          />
        </label>
        <label className="block">
          <span className="text-sm text-[var(--text-dim)]">{t.bio}</span>
          <textarea
            name="bio"
            maxLength={280}
            rows={4}
            defaultValue={profile?.bio ?? ""}
            placeholder={t.bioPlaceholder}
            className="mt-2 w-full resize-y border border-[var(--line)] bg-[var(--void)] px-4 py-3 outline-none focus:border-[var(--bright)]"
          />
        </label>
        <fieldset className="space-y-3">
          <legend className="text-sm text-[var(--text-dim)]">{t.links}</legend>
          {links.map((link, index) => (
            <div
              key={link.key}
              className="grid gap-2 sm:grid-cols-[0.7fr_1.3fr_auto] sm:items-center"
            >
              <input
                required
                maxLength={30}
                value={link.label}
                aria-label={`${t.linkLabel} ${index + 1}`}
                placeholder={t.linkLabel}
                onChange={(event) =>
                  setLinks((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, label: event.target.value }
                        : item,
                    ),
                  )
                }
                className="h-11 border border-[var(--line)] bg-[var(--void)] px-3 outline-none focus:border-[var(--bright)]"
              />
              <input
                required
                type="url"
                maxLength={2048}
                value={link.url}
                aria-label={`${t.linkUrl} ${index + 1}`}
                placeholder={t.linkUrl}
                onChange={(event) =>
                  setLinks((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, url: event.target.value }
                        : item,
                    ),
                  )
                }
                className="h-11 border border-[var(--line)] bg-[var(--void)] px-3 outline-none focus:border-[var(--bright)]"
              />
              <button
                type="button"
                onClick={() =>
                  setLinks((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="min-h-10 px-2 text-xs uppercase tracking-widest text-[var(--text-dim)] underline underline-offset-4"
              >
                {t.remove}
              </button>
            </div>
          ))}
          {links.length < 5 ? (
            <button
              type="button"
              onClick={() => {
                nextLinkId.current += 1;
                setLinks((current) => [
                  ...current,
                  { key: `new-${nextLinkId.current}`, label: "", url: "" },
                ]);
              }}
              className="text-xs uppercase tracking-widest text-[var(--text-dim)] underline underline-offset-4"
            >
              {t.addLink}
            </button>
          ) : null}
        </fieldset>
      </section>

      <section className="space-y-5">
        <div>
          <p className="section-label">PRIVATE</p>
          <h2 className="mt-3 font-pixel text-xl uppercase">
            {t.privateTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-dim)]">
            {t.privateHelp}
          </p>
        </div>
        <label className="block">
          <span className="text-sm text-[var(--text-dim)]">{t.fullName}</span>
          <input
            name="fullName"
            required
            minLength={2}
            maxLength={80}
            defaultValue={fullName ?? ""}
            autoComplete="name"
            className="mt-2 h-12 w-full border border-[var(--line)] bg-[var(--void)] px-4 outline-none focus:border-[var(--bright)]"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-[0.75fr_1.25fr]">
          {!editing ? (
            <label className="block">
              <span className="text-sm text-[var(--text-dim)]">
                {t.documentType}
              </span>
              <select
                name="documentType"
                required
                className="mt-2 h-12 w-full border border-[var(--line)] bg-[var(--void)] px-4 outline-none focus:border-[var(--bright)]"
              >
                <option value="dni">DNI / National ID</option>
                <option value="passport">Passport</option>
                <option value="ce">CE</option>
              </select>
            </label>
          ) : null}
          <label className={editing ? "block sm:col-span-2" : "block"}>
            <span className="text-sm text-[var(--text-dim)]">{t.document}</span>
            <input
              name="documentNumber"
              required={!editing}
              minLength={5}
              maxLength={40}
              autoComplete="off"
              aria-describedby={editing ? "document-edit-help" : undefined}
              className="mt-2 h-12 w-full border border-[var(--line)] bg-[var(--void)] px-4 outline-none focus:border-[var(--bright)]"
            />
            {editing ? (
              <span
                id="document-edit-help"
                className="mt-2 block text-xs text-[var(--text-dim)]"
              >
                {t.documentEditHelp}
              </span>
            ) : null}
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-[var(--text-dim)]">
            {t.vehiclePlate}
          </span>
          <input
            name="vehiclePlate"
            maxLength={20}
            defaultValue={vehiclePlate ?? ""}
            autoComplete="off"
            aria-describedby="vehicle-plate-help"
            className="mt-2 h-12 w-full border border-[var(--line)] bg-[var(--void)] px-4 uppercase outline-none focus:border-[var(--bright)]"
          />
          <span
            id="vehicle-plate-help"
            className="mt-2 block text-xs text-[var(--text-dim)]"
          >
            {t.vehiclePlateHelp}
          </span>
        </label>
        {!editing ? (
          <label className="flex cursor-pointer items-start gap-3 py-1">
            <input
              name="acceptsTerms"
              type="checkbox"
              required
              className="mt-1 size-4 accent-[var(--bright)]"
            />
            <span className="text-sm leading-relaxed">
              {t.terms}{" "}
              <Link
                href={`/${locale}/terms`}
                target="_blank"
                className="underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--bright)]"
              >
                {locale === "en" ? "Read terms." : "Leer terminos."}
              </Link>
            </span>
          </label>
        ) : null}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={pending}
          className="keycap min-h-12 px-5 font-pixel text-sm uppercase disabled:opacity-50"
        >
          {editing ? t.saveEdit : t.saveInitial}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="keycap-ghost min-h-12 px-5 font-pixel text-sm uppercase"
          >
            {t.cancel}
          </button>
        ) : null}
      </div>
    </form>
  );
}
