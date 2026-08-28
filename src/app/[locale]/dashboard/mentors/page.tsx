import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { cityName } from "@/lib/cities";
import { mentorsInCity } from "@/lib/dashboard/content";
import { findParticipantByUserId } from "@/lib/dashboard/state";

import {
  Basic,
  Empty,
  PageHeader,
  Panel,
  PanelHead,
  Pixel,
  Tag,
} from "@/components/dashboard/kit";

/**
 * Directorio, no agenda. Las mentorías funcionan acercándose a la mesa durante
 * el bloque de 11:00 a 13:00; aquí solo se responde a quién tienes en tu sede.
 */
export default async function MentorsPage({
  params,
}: PageProps<"/[locale]/dashboard/mentors">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");

  const session = await auth.api.getSession({ headers: await headers() });
  const participant = session
    ? await findParticipantByUserId(session.user.id)
    : null;
  if (!participant) return null;

  const mentors = mentorsInCity(participant.city);
  const hub = participant.city ? cityName(participant.city, locale) : null;

  return (
    <>
      <PageHeader
        n={50}
        label={t("mentors.label")}
        title={t("mentors.headline")}
        lede={t("mentors.lede")}
        aside={
          <div className="flex flex-wrap gap-1.5">
            <Tag strong>{t("mentors.window")}</Tag>
            {hub && <Tag>{hub}</Tag>}
          </div>
        }
      />

      <Panel className="mb-5">
        <PanelHead
          n={51}
          label={t("mentors.howLabel")}
          title={t("mentors.howTitle")}
        />
        <div className="px-4 py-3.5">
          <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
            {t("mentors.howBody")}
          </p>
        </div>
      </Panel>

      {mentors.length === 0 ? (
        <Panel>
          <Empty>{t("mentors.noneInHub")}</Empty>
        </Panel>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-2">
          {mentors.map((mentor, i) => (
            <Panel key={mentor.key} as="article">
              <header className="border-b border-[var(--line)] px-4 py-3.5">
                <Basic n={52 + i}>{t(`mentors.roles.${mentor.role}`)}</Basic>
                <Pixel size="lg" className="mt-2.5">
                  {mentor.org}
                </Pixel>
              </header>
              <div className="flex flex-wrap gap-1.5 px-4 py-3.5">
                {mentor.expertise.map((skill) => (
                  <Tag key={skill}>{skill}</Tag>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
