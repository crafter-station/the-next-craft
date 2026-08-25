"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { authClient } from "@/lib/auth-client";
import {
  formatParticipantNumber,
  participantProfilePath,
} from "@/lib/badge/profile";
import type { BadgeStudioState } from "@/lib/badge/state";

import {
  ProfileForm,
  type ProfileFormValue,
} from "@/components/badge/profile-form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import type { generateParticipantBadge } from "@/trigger/generate-participant-badge";

type Locale = "es" | "en";
type DashboardMode = "preview" | "edit" | "photo";
type CopyStatus = "idle" | "copied" | "error";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://thenextcraft.org";

const copy = {
  es: {
    eyebrow: "BADGE STUDIO",
    title: "Convierte tu foto en tu badge oficial.",
    manageTitle: "Administra tu perfil de participante.",
    intro:
      "Valida tu correo de Luma, completa tus datos y genera un retrato pixel art unico.",
    manageIntro:
      "Actualiza tu nombre publico, bio, enlaces o la foto de tu badge.",
    email: "Correo usado en Luma",
    send: "Enviar codigo",
    sent: "Si tu registro esta aceptado, recibiras un codigo en tu correo.",
    code: "Codigo de 6 digitos",
    verify: "Validar acceso",
    changeEmail: "Cambiar correo o reenviar",
    detailsTitle: "Datos de acreditacion",
    fullName: "Nombre completo",
    documentType: "Tipo de documento",
    document: "Numero de documento",
    terms: "Acepto los terminos y condiciones del hackathon.",
    save: "Guardar y continuar",
    photoTitle: "Sube tu foto",
    photoHelp:
      "JPG, PNG o WebP de hasta 8 MB. Usa una foto frontal, nitida y con una sola persona.",
    photoPreview: "Vista previa de la foto seleccionada",
    generate: "Generar badge",
    generating: "GENERANDO PIXELES...",
    preparing: "PREPARANDO TU FOTO...",
    pixelArt: "CREANDO PIXEL ART...",
    backgroundRemoval: "REMOVIENDO EL FONDO...",
    rendering: "RENDERIZANDO TU BADGE...",
    generatingHelp:
      "Esto puede tomar varios minutos. Puedes dejar esta pagina abierta.",
    loadingState: "Cargando tu progreso...",
    reconnect: "Reconectar estado",
    complete: "Tu badge esta listo.",
    participant: "PARTICIPANTE",
    editProfile: "Editar perfil",
    replacePhoto: "Cambiar foto",
    cancel: "Cancelar",
    replacementFailed:
      "No pudimos reemplazar la foto. Tu badge anterior sigue publicado.",
    download: "Descargar badge",
    downloadPortrait: "Descargar retrato PNG",
    open: "Abrir pagina publica",
    socialTitle: "Comparte que estarás en The Next Craft.",
    socialPost:
      "¡Ya soy parte de The Next Craft!\n\nEste sábado 29 de agosto tendré 12 horas para convertir una idea en un producto real, junto a 300 hackers construyendo en simultáneo desde cinco ciudades de Latinoamérica.\n\nUn día para crear, probar y llevar una idea hasta el final.\n\nNos vemos en el hackathon.\n\n#TheNextCraft",
    xPost:
      "¡Ya soy parte de #TheNextCraft!\n\nEste sábado 29 de agosto tendré 12 horas para convertir una idea en un producto real, junto a 300 hackers construyendo en simultáneo desde cinco ciudades de Latinoamérica.\n\nNos vemos en el hackathon.",
    socialHelp:
      "Instagram compartirá el archivo desde tu dispositivo. LinkedIn y X abrirán un post con la vista previa de tu badge.",
    copyPost: "Copiar texto",
    copiedPost: "Texto copiado",
    copyFailed: "Selecciona el texto y cópialo manualmente.",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    x: "X",
    retry: "Probar con otra foto",
    rejected: "No pudimos procesar esa foto. Prueba con una imagen distinta.",
    failed:
      "La generacion fallo. Puedes volver a intentarlo cuando termine el limite.",
    rate: "Solo se permite una generacion cada 15 minutos.",
    otpRate: "Ya solicitaste un codigo. Espera un minuto antes de reenviarlo.",
    genericError: "No pudimos completar la solicitud. Intenta nuevamente.",
    signOut: "Salir",
  },
  en: {
    eyebrow: "BADGE STUDIO",
    title: "Turn your photo into your official badge.",
    manageTitle: "Manage your participant profile.",
    intro:
      "Verify your Luma email, complete your details, and generate a unique pixel-art portrait.",
    manageIntro: "Update your public name, bio, links, or badge photo.",
    email: "Email used on Luma",
    send: "Send code",
    sent: "If your registration is accepted, a code will arrive in your inbox.",
    code: "6-digit code",
    verify: "Verify access",
    changeEmail: "Change email or resend",
    detailsTitle: "Accreditation details",
    fullName: "Full name",
    documentType: "Document type",
    document: "Document number",
    terms: "I accept the hackathon terms and conditions.",
    save: "Save and continue",
    photoTitle: "Upload your photo",
    photoHelp:
      "JPG, PNG, or WebP up to 8 MB. Use a clear, front-facing photo with one person.",
    photoPreview: "Preview of the selected photo",
    generate: "Generate badge",
    generating: "GENERATING PIXELS...",
    preparing: "PREPARING YOUR PHOTO...",
    pixelArt: "CREATING PIXEL ART...",
    backgroundRemoval: "REMOVING THE BACKGROUND...",
    rendering: "RENDERING YOUR BADGE...",
    generatingHelp:
      "This may take several minutes. You can leave this page open.",
    loadingState: "Loading your progress...",
    reconnect: "Reconnect status",
    complete: "Your badge is ready.",
    participant: "PARTICIPANT",
    editProfile: "Edit profile",
    replacePhoto: "Replace photo",
    cancel: "Cancel",
    replacementFailed:
      "We could not replace the photo. Your previous badge is still public.",
    download: "Download badge",
    downloadPortrait: "Download transparent PNG",
    open: "Open public page",
    socialTitle: "Share that you are joining The Next Craft.",
    socialPost:
      "I'm joining The Next Craft!\n\nThis Saturday, August 29, I'll have 12 hours to turn an idea into a real product alongside 300 hackers building simultaneously across five Latin American cities.\n\nOne day to create, test, and take an idea all the way.\n\nSee you at the hackathon.\n\n#TheNextCraft",
    xPost:
      "I'm joining #TheNextCraft!\n\nThis Saturday, August 29, I'll have 12 hours to turn an idea into a real product alongside 300 hackers building simultaneously across five Latin American cities.\n\nSee you at the hackathon.",
    socialHelp:
      "Instagram will share the file from your device. LinkedIn and X will open a post with your badge preview.",
    copyPost: "Copy text",
    copiedPost: "Text copied",
    copyFailed: "Select the text and copy it manually.",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    x: "X",
    retry: "Try another photo",
    rejected: "We could not process that photo. Try a different image.",
    failed: "Generation failed. You can retry after the rate limit ends.",
    rate: "Only one generation is allowed every 15 minutes.",
    otpRate: "A code was already requested. Wait one minute before resending.",
    genericError: "We could not complete the request. Please try again.",
    signOut: "Sign out",
  },
} as const;

const loadingPixels = Array.from({ length: 64 }, (_, index) => ({
  id: `pixel-${index}`,
  delay: `${(index % 8) * 70}ms`,
}));
const otpSlots = [
  "digit-1",
  "digit-2",
  "digit-3",
  "digit-4",
  "digit-5",
  "digit-6",
];

type GeneratingState = Extract<BadgeStudioState, { stage: "generating" }>;

function RealtimeGeneration({
  state,
  locale,
  onSettled,
}: {
  state: GeneratingState;
  locale: Locale;
  onSettled: () => void;
}) {
  const t = copy[locale];
  const { run, error } = useRealtimeRun<typeof generateParticipantBadge>(
    state.runId ?? undefined,
    {
      accessToken: state.publicAccessToken ?? undefined,
      enabled: Boolean(state.runId && state.publicAccessToken),
      skipColumns: ["payload", "output"],
      onComplete: () => onSettled(),
    },
  );
  const phase = run?.metadata?.phase;
  const phaseLabel =
    phase === "pixel-art"
      ? t.pixelArt
      : phase === "background-removal"
        ? t.backgroundRemoval
        : phase === "rendering"
          ? t.rendering
          : phase === "preparing"
            ? t.preparing
            : t.generating;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-96 flex-col items-center justify-center text-center"
    >
      <div className="mb-8 grid grid-cols-8 gap-1" aria-hidden="true">
        {loadingPixels.map((pixel) => (
          <span
            key={pixel.id}
            className="size-2 animate-pulse bg-[var(--bright)] motion-reduce:animate-none"
            style={{ animationDelay: pixel.delay }}
          />
        ))}
      </div>
      <p className="section-label">{run?.status ?? "CONNECTING"}</p>
      <h2 className="mt-3 font-pixel text-2xl">{phaseLabel}</h2>
      <p className="mt-4 max-w-md text-sm text-[var(--text-dim)]">
        {t.generatingHelp}
      </p>
      {error || !state.runId || !state.publicAccessToken ? (
        <button
          type="button"
          onClick={onSettled}
          className="mt-6 text-xs uppercase tracking-widest text-[var(--text-dim)] underline underline-offset-4"
        >
          {t.reconnect}
        </button>
      ) : null}
    </div>
  );
}

type Props = {
  locale: Locale;
  initialSession: typeof authClient.$Infer.Session | null;
  initialState: BadgeStudioState | null;
};

async function getBadgeStatus() {
  const response = await fetch("/api/badge/status", { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as BadgeStudioState;
}

class BadgeRequestError extends Error {
  constructor(readonly status: number) {
    super(`Badge request failed with status ${status}`);
  }
}

function SocialSharePanel({
  locale,
  imageUrl,
  participantNumber,
}: {
  locale: Locale;
  imageUrl: string;
  participantNumber: number;
}) {
  const t = copy[locale];
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const formattedNumber = formatParticipantNumber(participantNumber);
  const profileUrl = new URL(
    participantProfilePath(participantNumber, locale),
    SITE_URL,
  ).toString();
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
  const xUrl = `https://x.com/intent/post?${new URLSearchParams({
    text: t.xPost,
    url: profileUrl,
  })}`;
  const filename = `the-next-craft-${formattedNumber}.jpg`;

  async function copySocialPost() {
    try {
      await navigator.clipboard.writeText(t.socialPost);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  async function shareOnInstagram() {
    void copySocialPost();

    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Could not load badge image");
        const blob = await response.blob();
        const file = new File([blob], filename, {
          type: blob.type || "image/jpeg",
        });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: t.socialPost });
          return;
        }
      } catch (shareError) {
        if (
          shareError instanceof DOMException &&
          shareError.name === "AbortError"
        )
          return;
      }
    }

    const download = document.createElement("a");
    download.href = imageUrl;
    download.download = filename;
    download.click();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  return (
    <section className="border border-[var(--line)] bg-[var(--screen-dim)] p-5 md:col-span-2 md:p-6">
      <p className="section-label">READY TO POST_</p>
      <h2 className="mt-3 font-pixel text-lg leading-relaxed uppercase">
        {t.socialTitle}
      </h2>
      <textarea
        readOnly
        value={t.socialPost}
        aria-label={t.socialTitle}
        onFocus={(event) => event.currentTarget.select()}
        className="mt-5 min-h-48 w-full resize-none border border-[var(--line)] bg-[var(--void)] p-4 text-sm leading-relaxed text-[var(--text)] outline-none focus:border-[var(--bright)]"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => void copySocialPost()}
          className="keycap inline-flex min-h-12 items-center justify-center px-4 font-pixel text-xs uppercase"
        >
          {copyStatus === "copied" ? t.copiedPost : t.copyPost}
        </button>
        <button
          type="button"
          onClick={() => void shareOnInstagram()}
          className="keycap-ghost inline-flex min-h-12 items-center justify-center px-4 font-pixel text-xs uppercase"
        >
          {t.instagram}
        </button>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noreferrer"
          onClick={() => void copySocialPost()}
          className="keycap-ghost inline-flex min-h-12 items-center justify-center px-4 font-pixel text-xs uppercase"
        >
          {t.linkedin}
        </a>
        <a
          href={xUrl}
          target="_blank"
          rel="noreferrer"
          className="keycap-ghost inline-flex min-h-12 items-center justify-center px-4 font-pixel text-xs uppercase"
        >
          {t.x}
        </a>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[var(--text-dim)]">
        {t.socialHelp}
      </p>
      <p aria-live="polite" className="mt-2 min-h-4 text-xs">
        {copyStatus === "copied"
          ? t.copiedPost
          : copyStatus === "error"
            ? t.copyFailed
            : ""}
      </p>
    </section>
  );
}

export function BadgeStudio({ locale, initialSession, initialState }: Props) {
  authClient.hydrateSession(initialSession);
  const {
    data: clientSession,
    isPending: isSessionPending,
    isRefetching: isSessionRefetching,
    refetch: refetchSession,
  } = authClient.useSession();
  const session =
    isSessionPending && !isSessionRefetching ? initialSession : clientSession;
  const authenticated = Boolean(session);
  const t = copy[locale];
  const router = useRouter();
  const [email, setEmail] = useState(initialSession?.user.email ?? "");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [state, setState] = useState<BadgeStudioState | null>(initialState);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>("preview");
  const sessionUserId = session?.user.id ?? null;

  async function refreshStatus() {
    const nextState = await getBadgeStatus();
    if (!nextState) return;
    setState(nextState);
    if (nextState.stage === "completed") router.refresh();
  }

  const requestOtpMutation = useMutation({
    mutationFn: async (requestedEmail: string) => {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: requestedEmail,
        type: "sign-in",
      });
      if (result.error) throw new BadgeRequestError(result.error.status);
    },
    onMutate: () => setError(null),
    onError: (mutationError) =>
      setError(
        mutationError instanceof BadgeRequestError &&
          mutationError.status === 429
          ? t.otpRate
          : t.genericError,
      ),
    onSuccess: () => setOtpSent(true),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({
      requestedEmail,
      otp,
    }: {
      requestedEmail: string;
      otp: string;
    }) => {
      const result = await authClient.signIn.emailOtp(
        {
          email: requestedEmail,
          otp,
          name: requestedEmail.split("@")[0] || "Participant",
        },
        { disableSignal: true },
      );
      if (result.error) throw new Error("Could not verify OTP");
    },
    onMutate: () => setError(null),
    onError: () => setError(t.genericError),
    onSuccess: () => refetchSession(),
  });

  const saveProfileMutation = useMutation({
    mutationFn: async ({
      value,
      method,
    }: {
      value: ProfileFormValue;
      method: "POST" | "PATCH";
    }) => {
      const response = await fetch("/api/badge/profile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      if (!response.ok) throw new BadgeRequestError(response.status);
    },
    onMutate: () => setError(null),
    onError: () => setError(t.genericError),
    onSuccess: async (_, { method }) => {
      await refreshStatus();
      if (method === "PATCH") setDashboardMode("preview");
    },
  });

  const generateBadgeMutation = useMutation({
    mutationFn: async (selectedPhoto: File) => {
      const body = new FormData();
      body.set("photo", selectedPhoto);
      const response = await fetch("/api/badge/generate", {
        method: "POST",
        body,
      });
      if (!response.ok) throw new BadgeRequestError(response.status);
    },
    onMutate: () => setError(null),
    onError: async (mutationError) => {
      if (
        mutationError instanceof BadgeRequestError &&
        mutationError.status === 429
      ) {
        setError(t.rate);
      } else if (
        mutationError instanceof BadgeRequestError &&
        mutationError.status === 409
      ) {
        await refreshStatus();
      } else {
        setError(t.genericError);
      }
    },
    onSuccess: async () => {
      await refreshStatus();
      setPhoto(null);
      setDashboardMode("preview");
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Could not sign out");
    },
    onMutate: () => setError(null),
    onError: () => setError(t.genericError),
    onSuccess: () => {
      setState(null);
      setOtpSent(false);
      setCode("");
      setPhoto(null);
      setDashboardMode("preview");
    },
  });

  const isPending =
    requestOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    saveProfileMutation.isPending ||
    generateBadgeMutation.isPending ||
    signOutMutation.isPending;

  useEffect(() => {
    if (!sessionUserId || state) return;

    let cancelled = false;
    void getBadgeStatus().then((nextState) => {
      if (cancelled) return;
      if (!nextState) {
        setError(t.genericError);
        return;
      }
      setState(nextState);
      setError(null);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionUserId, state, t.genericError]);

  useEffect(() => {
    if (!photo) {
      setPhotoPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(photo);
    setPhotoPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photo]);

  function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    requestOtpMutation.mutate(email.trim());
  }

  function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    verifyOtpMutation.mutate({
      requestedEmail: email.trim(),
      otp: code.trim(),
    });
  }

  function createProfile(value: ProfileFormValue) {
    saveProfileMutation.mutate({ value, method: "POST" });
  }

  function updateProfile(value: ProfileFormValue) {
    saveProfileMutation.mutate({ value, method: "PATCH" });
  }

  function generateBadge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) return;
    generateBadgeMutation.mutate(photo);
  }

  const completedState = state?.stage === "completed" ? state : null;
  const completedProfile = completedState?.profile ?? null;
  const isUploadStage = state?.stage === "upload";
  const showPhotoForm =
    isUploadStage ||
    (state?.stage === "completed" && dashboardMode === "photo");
  const managingExistingBadge =
    state?.stage === "completed" ||
    (state?.stage === "generating" && state.hasCurrentBadge);
  const showingCompletedBadge = Boolean(
    completedProfile && dashboardMode === "preview",
  );
  const pageTitle = showingCompletedBadge
    ? t.complete
    : showPhotoForm
      ? t.photoTitle
      : state?.stage === "generating"
        ? t.generating
        : managingExistingBadge
          ? t.manageTitle
          : t.title;
  const pageIntro = showingCompletedBadge
    ? `${completedProfile?.displayName} / ${t.participant} #${formatParticipantNumber(completedProfile?.participantNumber ?? 0)}`
    : showPhotoForm
      ? t.photoHelp
      : managingExistingBadge
        ? t.manageIntro
        : t.intro;
  const completedBadgeImageUrl = completedProfile
    ? `/api/badge/image/${formatParticipantNumber(completedProfile.participantNumber)}?v=${encodeURIComponent(completedProfile.updatedAt)}`
    : null;

  return (
    <div className="relative z-10 mx-auto max-w-5xl">
      <header className="mb-10 md:mb-14">
        <div className="flex items-center justify-between gap-6">
          <p className="section-label">{t.eyebrow}</p>
          {authenticated ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => signOutMutation.mutate()}
              className="text-xs uppercase tracking-widest text-[var(--text-dim)] underline underline-offset-4 transition-colors hover:text-[var(--text)] disabled:opacity-50"
            >
              {t.signOut}
            </button>
          ) : null}
        </div>
        <h1 className="pixel-heading mt-5 max-w-2xl text-3xl md:text-4xl">
          {pageTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--text-dim)] md:text-base">
          {pageIntro}
        </p>
      </header>

      <section className={showingCompletedBadge ? "" : "max-w-2xl"}>
        {!authenticated ? (
          <div className="space-y-8">
            {!otpSent ? (
              <form onSubmit={requestOtp} className="space-y-5">
                <label className="block">
                  <span className="section-label">{t.email}</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-3 h-12 w-full border border-[var(--line)] bg-[var(--void)] px-4 outline-none focus:border-[var(--bright)]"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isPending}
                  className="keycap min-h-12 w-full px-5 font-pixel text-sm uppercase disabled:opacity-50"
                >
                  {t.send}
                </button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5">
                <p
                  role="status"
                  className="border-l-2 border-[var(--bright)] pl-4 text-sm text-[var(--text-dim)]"
                >
                  {t.sent}
                </p>
                <label className="block" htmlFor="badge-otp">
                  <span className="section-label">{t.code}</span>
                  <InputOTP
                    id="badge-otp"
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={code}
                    onChange={setCode}
                    disabled={isPending}
                    containerClassName="mt-3 w-full"
                  >
                    <InputOTPGroup className="w-full">
                      {otpSlots.map((slot, index) => (
                        <InputOTPSlot
                          key={slot}
                          index={index}
                          aria-invalid={Boolean(error)}
                          className="h-14 flex-1 rounded-none font-pixel text-xl first:rounded-none last:rounded-none"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </label>
                <button
                  type="submit"
                  disabled={isPending}
                  className="keycap min-h-12 w-full px-5 font-pixel text-sm uppercase disabled:opacity-50"
                >
                  {t.verify}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setCode("");
                    setError(null);
                  }}
                  className="w-full text-xs uppercase tracking-widest text-[var(--text-dim)] underline underline-offset-4"
                >
                  {t.changeEmail}
                </button>
              </form>
            )}
          </div>
        ) : null}

        {authenticated && !state ? (
          <div
            role="status"
            aria-live="polite"
            className="grid min-h-48 place-items-center text-center font-pixel text-sm uppercase text-[var(--text-dim)]"
          >
            {t.loadingState}
          </div>
        ) : null}

        {authenticated && state?.stage === "details" ? (
          <ProfileForm
            locale={locale}
            fullName={state.fullName}
            pending={isPending}
            onSubmit={createProfile}
          />
        ) : null}

        {authenticated && showPhotoForm ? (
          <form onSubmit={generateBadge} className="space-y-6">
            {state.stage === "upload" && state.error === "rejected" ? (
              <p className="border-l-2 border-red-400 pl-4 text-sm">
                {t.rejected}
              </p>
            ) : null}
            {state.stage === "upload" && state.error === "failed" ? (
              <p className="border-l-2 border-red-400 pl-4 text-sm">
                {t.failed}
              </p>
            ) : null}
            <label className="grid min-h-48 cursor-pointer place-items-center overflow-hidden border border-dashed border-[var(--line)] bg-[var(--void)] p-3 text-center hover:border-[var(--bright)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--bright)]">
              <input
                type="file"
                name="photo"
                required
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  if (selected && selected.size > 8 * 1024 * 1024) {
                    setPhoto(null);
                    setError(t.photoHelp);
                    event.target.value = "";
                    return;
                  }
                  setError(null);
                  setPhoto(selected);
                }}
              />
              {photo && photoPreviewUrl ? (
                <span className="grid w-full gap-3">
                  {/* biome-ignore lint/performance/noImgElement: local object URL selected by the user. */}
                  <img
                    src={photoPreviewUrl}
                    alt={t.photoPreview}
                    className="max-h-96 w-full object-contain"
                  />
                  <span className="break-all font-pixel text-xs uppercase text-[var(--text-dim)]">
                    {photo.name}
                  </span>
                </span>
              ) : (
                <span className="p-3 font-pixel text-sm uppercase text-[var(--text-dim)]">
                  SELECT PHOTO_
                </span>
              )}
            </label>
            <p className="text-xs text-[var(--text-dim)]">{t.rate}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={isPending || !photo}
                className="keycap min-h-12 px-5 font-pixel text-sm uppercase disabled:opacity-50"
              >
                {state.stage === "completed"
                  ? t.replacePhoto
                  : state.error
                    ? t.retry
                    : t.generate}
              </button>
              {state.stage === "completed" ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setDashboardMode("preview");
                  }}
                  className="keycap-ghost min-h-12 px-5 font-pixel text-sm uppercase"
                >
                  {t.cancel}
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        {authenticated && state?.stage === "generating" ? (
          <RealtimeGeneration
            key={state.publicAccessToken ?? state.runId ?? "pending"}
            state={state}
            locale={locale}
            onSettled={() => void refreshStatus()}
          />
        ) : null}

        {authenticated &&
        state?.stage === "completed" &&
        dashboardMode === "edit" ? (
          <ProfileForm
            key={state.profile.updatedAt}
            locale={locale}
            fullName={state.fullName}
            profile={state.profile}
            pending={isPending}
            onSubmit={updateProfile}
            onCancel={() => setDashboardMode("preview")}
          />
        ) : null}

        {authenticated && completedProfile && dashboardMode === "preview" ? (
          <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-12">
            {completedState?.replacementError ? (
              <p className="border-l-2 border-red-400 pl-4 text-sm md:col-span-2">
                {t.replacementFailed}
              </p>
            ) : null}
            {/* biome-ignore lint/performance/noImgElement: dynamic generated image. */}
            <img
              src={completedBadgeImageUrl ?? undefined}
              width={1080}
              height={1350}
              alt={t.complete}
              className="aspect-[4/5] w-full"
            />
            <div className="grid gap-6 md:sticky md:top-10">
              <button
                type="button"
                onClick={() => setDashboardMode("edit")}
                className="keycap min-h-12 px-4 text-center font-pixel text-xs uppercase"
              >
                {t.editProfile}
              </button>
              <div className="grid justify-items-start gap-4 text-sm">
                <Link
                  href={participantProfilePath(
                    completedProfile.participantNumber,
                    locale,
                  )}
                  className="text-[var(--text-dim)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--text)]"
                >
                  {t.open}
                </Link>
                <a
                  href={completedBadgeImageUrl ?? undefined}
                  download={`the-next-craft-${formatParticipantNumber(completedProfile.participantNumber)}.jpg`}
                  className="text-[var(--text-dim)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--text)]"
                >
                  {t.download}
                </a>
                <a
                  href={`/api/badge/portrait/${formatParticipantNumber(completedProfile.participantNumber)}?v=${encodeURIComponent(completedProfile.updatedAt)}`}
                  download={`the-next-craft-portrait-${formatParticipantNumber(completedProfile.participantNumber)}.png`}
                  className="text-[var(--text-dim)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--text)]"
                >
                  {t.downloadPortrait}
                </a>
                <button
                  type="button"
                  onClick={() => setDashboardMode("photo")}
                  className="text-[var(--text-dim)] underline decoration-[var(--line)] underline-offset-4 transition-colors hover:text-[var(--text)]"
                >
                  {t.replacePhoto}
                </button>
              </div>
            </div>
            {completedBadgeImageUrl ? (
              <SocialSharePanel
                locale={locale}
                imageUrl={completedBadgeImageUrl}
                participantNumber={completedProfile.participantNumber}
              />
            ) : null}
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-6 border-l-2 border-red-400 pl-4 text-sm text-red-300"
          >
            {error}
          </p>
        ) : null}
      </section>
    </div>
  );
}
