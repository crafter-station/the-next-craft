import path from "node:path";

import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import {
  type EventRole,
  eventDetails,
  organizers,
  roleDetails,
} from "./event-details";

export type FormalRoleInvitationProps = {
  eventRole: EventRole;
  recipientName: string;
  recipientBackground?: string;
  issuedOn: string;
};

const colors = {
  ink: "#1a1a17",
  muted: "#686862",
  line: "#d1d1cc",
  header: "#e8e8e4",
  soft: "#f3f3f0",
  paper: "#ffffff",
} as const;

const signatures: Record<string, string> = {
  "Shiara Arauzo": path.join(
    process.cwd(),
    "documents",
    "role-invitations",
    "assets",
    "shiara-arauzo-signature.png",
  ),
  "Anthony Cueva": path.join(
    process.cwd(),
    "documents",
    "role-invitations",
    "assets",
    "anthony-cueva-signature.png",
  ),
};

const wordmarkFont = path.join(
  process.cwd(),
  "documents",
  "role-invitations",
  "assets",
  "borel-regular.ttf",
);

Font.registerHyphenationCallback((word) => [word]);
Font.register({ family: "Borel", src: wordmarkFont });

export function FormalRoleInvitation({
  eventRole,
  recipientName,
  recipientBackground,
  issuedOn,
}: FormalRoleInvitationProps) {
  const role = roleDetails[eventRole];
  const reference = `TNC-2026-${eventRole.toUpperCase()}-INVITATION`;

  return (
    <Document
      title={`${eventDetails.name} · Invitación formal · ${role.label}`}
      author="Crafter Station"
      subject={`Invitación para ${recipientName}`}
      keywords={`The Next Craft, Crafter Station, ${role.noun}, invitación`}
      language="es"
    >
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.topRule} />

        <View style={styles.header}>
          <View>
            <Text style={styles.command}>
              10 PRINT &quot;INVITACIÓN FORMAL&quot;
            </Text>
            <Text style={styles.wordmark}>the next craft</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaLabel}>HACKATHON REGIONAL 2026</Text>
            <Text style={styles.headerMetaValue}>
              CRAFTED BY CRAFTER STATION
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.documentMeta}>
            <Text style={styles.roleLabel}>{role.label}</Text>
            <View style={styles.metaRight}>
              <Text style={styles.issueDate}>{issuedOn}</Text>
              <Text style={styles.reference}>{reference}</Text>
            </View>
          </View>

          <Text style={styles.recipientLabel}>
            PARA / {recipientName.toUpperCase()}
          </Text>
          <Text style={styles.title}>{role.headline}</Text>

          <View style={styles.rule} />

          <Text style={styles.greeting}>{recipientName.split(" ")[0]},</Text>
          <Text style={styles.paragraph}>{role.introduction}</Text>
          <Text style={styles.paragraph}>{role.contribution}</Text>

          {recipientBackground ? (
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>POR QUÉ TÚ</Text>
              <Text style={styles.paragraph}>{recipientBackground}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>DATOS DEL EVENTO</Text>
            {role.schedule.map(([label, value]) => (
              <View style={styles.detailRow} key={label}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>TU APORTE EN LA SALA</Text>
            {role.expectations.map((expectation, index) => (
              <View style={styles.expectation} key={expectation}>
                <Text style={styles.bullet}>0{index + 1}</Text>
                <Text style={styles.expectationText}>{expectation}</Text>
              </View>
            ))}
          </View>

          <View style={styles.nextStep}>
            <Text style={styles.nextStepLabel}>SIGUIENTE PASO</Text>
            <Text style={styles.nextStepText}>
              Confirma tu participación respondiendo a esta invitación.{" "}
              {role.logisticsNote}
            </Text>
          </View>

          <View style={styles.approvals}>
            <Text style={styles.approvalsLabel}>INVITACIÓN EMITIDA POR</Text>
            <View style={styles.approvalsRow}>
              {organizers.map((organizer) => (
                <View style={styles.approval} key={organizer.name}>
                  <Image
                    src={signatures[organizer.name]}
                    style={styles.signature}
                  />
                  <View style={styles.approvalRule} />
                  <Text style={styles.approverName}>{organizer.name}</Text>
                  <Text style={styles.approverMeta}>
                    {organizer.title} · {organizer.organization}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>300 BUILDERS · 5 SEDES · 12 HORAS</Text>
          <Link src={eventDetails.siteUrl} style={styles.footerLink}>
            THENEXTCRAFT.ORG
          </Link>
        </View>
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    position: "relative",
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.48,
  },
  topRule: { height: 4, backgroundColor: colors.ink },
  header: {
    height: 64,
    paddingHorizontal: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.header,
  },
  command: {
    color: colors.muted,
    fontFamily: "Courier-Bold",
    fontSize: 6.5,
    letterSpacing: 0.8,
  },
  wordmark: {
    marginTop: 4,
    fontFamily: "Borel",
    fontSize: 21,
    lineHeight: 1.2,
  },
  headerMeta: { alignItems: "flex-end" },
  headerMetaLabel: {
    fontFamily: "Courier-Bold",
    fontSize: 7,
    letterSpacing: 0.7,
  },
  headerMetaValue: {
    marginTop: 4,
    color: colors.muted,
    fontFamily: "Courier",
    fontSize: 6.2,
    letterSpacing: 0.45,
  },
  content: {
    paddingTop: 15,
    paddingHorizontal: 52,
    paddingBottom: 20,
  },
  documentMeta: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  roleLabel: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: colors.soft,
    fontFamily: "Courier-Bold",
    fontSize: 7,
    letterSpacing: 0.8,
  },
  metaRight: { alignItems: "flex-end" },
  issueDate: {
    fontFamily: "Courier-Bold",
    fontSize: 7.5,
  },
  reference: {
    marginTop: 3,
    color: colors.muted,
    fontFamily: "Courier",
    fontSize: 6,
    letterSpacing: 0.35,
  },
  recipientLabel: {
    marginTop: 13,
    color: colors.muted,
    fontFamily: "Courier-Bold",
    fontSize: 7.5,
    letterSpacing: 0.9,
  },
  title: {
    marginTop: 6,
    maxWidth: 470,
    fontFamily: "Helvetica-Bold",
    fontSize: 21,
    lineHeight: 1.08,
    letterSpacing: -0.55,
  },
  rule: {
    marginTop: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  greeting: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
  },
  paragraph: {
    marginTop: 5,
    color: "#333330",
    fontSize: 8.4,
    lineHeight: 1.45,
  },
  section: { marginTop: 8 },
  sectionHeader: {
    marginBottom: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.soft,
    fontFamily: "Courier-Bold",
    fontSize: 7,
    letterSpacing: 0.8,
  },
  detailRow: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  detailLabel: {
    color: colors.muted,
    fontFamily: "Courier-Bold",
    fontSize: 6.2,
    letterSpacing: 0.55,
  },
  detailValue: {
    marginTop: 1,
    fontSize: 8,
  },
  expectation: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  bullet: {
    width: 27,
    color: colors.muted,
    fontFamily: "Courier-Bold",
    fontSize: 7,
  },
  expectationText: { flex: 1, fontSize: 8 },
  nextStep: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.soft,
  },
  nextStepLabel: {
    fontFamily: "Courier-Bold",
    fontSize: 7,
    letterSpacing: 0.8,
  },
  nextStepText: {
    marginTop: 3,
    fontSize: 8,
    lineHeight: 1.4,
  },
  approvals: { marginTop: 8 },
  approvalsLabel: {
    color: colors.muted,
    fontFamily: "Courier-Bold",
    fontSize: 7,
    letterSpacing: 0.8,
  },
  approvalsRow: {
    marginTop: 3,
    flexDirection: "row",
    gap: 48,
  },
  approval: { width: 180 },
  signature: {
    width: 82,
    height: 30,
    objectFit: "contain",
    objectPosition: "left bottom",
  },
  approvalRule: {
    borderTopWidth: 1,
    borderTopColor: colors.ink,
  },
  approverName: {
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
    fontSize: 7.8,
  },
  approverMeta: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: "Courier",
    fontSize: 6.4,
  },
  footer: {
    position: "absolute",
    right: 52,
    bottom: 1,
    left: 52,
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    color: colors.muted,
    fontFamily: "Courier",
    fontSize: 6.2,
    letterSpacing: 0.4,
  },
  footerLink: { color: colors.muted, textDecoration: "none" },
});
