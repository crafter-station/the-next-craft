import QRCode from "qrcode";

import { BADGE_THEME } from "./theme";

export async function qrDataUri(url: string) {
  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 224,
    margin: 1,
    color: { dark: BADGE_THEME.void, light: BADGE_THEME.textDim },
    errorCorrectionLevel: "M",
  });
  return `data:image/png;base64,${png.toString("base64")}`;
}
