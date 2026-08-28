import { headers } from "next/headers";

import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { cityName } from "@/lib/cities";
import { type Mentor, mentorsByHub } from "@/lib/dashboard/content";
import { findParticipantByUserId } from "@/lib/dashboard/state";

import {
  Empty,
  PageHeader,
  Panel,
  PanelHead,
  Row,
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

  const { hub, unassigned } = mentorsByHub(participant.city);
  const hubName = participant.city ? cityName(participant.city, locale) : null;

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
            {hubName && <Tag>{hubName}</Tag>}
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

      <Panel className="mb-5">
        <PanelHead
          n={52}
          label={t("mentors.hubLabel")}
          title={
            hubName
              ? t("mentors.hubTitle", { hub: hubName.toUpperCase() })
              : t("mentors.hubTitleUnknown")
          }
          aside={<Tag strong={hub.length > 0}>{hub.length}</Tag>}
        />
        {hub.length === 0 ? (
          <Empty>{t("mentors.noneInHub")}</Empty>
        ) : (
          <MentorRows mentors={hub} />
        )}
      </Panel>

      {/* Callarse a los que aún no tienen sede sería enseñar una lista corta
          como si estuviera completa, justo el día que alguien decide si vale
          la pena levantarse a buscar a un mentor. */}
      {unassigned.length > 0 && (
        <Panel>
          <PanelHead
            n={53}
            label={t("mentors.pendingLabel")}
            title={t("mentors.pendingTitle", { count: unassigned.length })}
            aside={<Tag>{unassigned.length}</Tag>}
          />
          <div className="border-b border-[var(--line)] px-4 py-3.5">
            <p className="font-mono text-[13px] leading-relaxed text-[var(--text-dim)]">
              {t("mentors.pendingBody")}
            </p>
          </div>
          <MentorRows mentors={unassigned} />
        </Panel>
      )}
    </>
  );
}

function MentorRows({ mentors }: { mentors: Mentor[] }) {
  return (
    <ul>
      {mentors.map((mentor) => (
        <Row key={mentor.slug} marker="→">
          <span className="text-[var(--text)]">{mentor.name}</span>
        </Row>
      ))}
    </ul>
  );
}
