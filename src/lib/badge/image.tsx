/** @jsxImportSource react */
import { ImageResponse } from "@takumi-rs/image-response";
import sharp from "sharp";

import { BadgeTemplate } from "@/components/badge/badge-template";

import { crafterMark, organizerMarks } from "./brand";
import { BADGE_HEIGHT, BADGE_WIDTH } from "./constants";
import { qrDataUri } from "./qr";
import { getBadgeRenderer } from "./renderer";
import { badgeTexture } from "./texture";

export async function renderBadgeImage(input: {
  displayName: string;
  participantNumber: number;
  portrait: Buffer;
  shareUrl: string;
}): Promise<Buffer> {
  const portrait = await sharp(input.portrait)
    .ensureAlpha()
    .resize(1024, 1536, {
      fit: "inside",
      kernel: sharp.kernel.nearest,
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  const image = new ImageResponse(
    <BadgeTemplate
      name={input.displayName}
      participantNumber={input.participantNumber.toString().padStart(3, "0")}
      photoDataUri={`data:image/png;base64,${portrait.toString("base64")}`}
      qrDataUri={await qrDataUri(input.shareUrl)}
      crafter={await crafterMark(160)}
      organizers={await organizerMarks(160)}
    />,
    {
      width: BADGE_WIDTH,
      height: BADGE_HEIGHT,
      format: "png",
      renderer: await getBadgeRenderer(),
    },
  );

  const rendered = Buffer.from(await image.arrayBuffer());
  return sharp(rendered)
    .composite([{ input: await badgeTexture(), blend: "over" }])
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();
}
