export type ParsedPerkRow = {
  email?: string;
  partnerKey: string;
  code: string;
};

/** Una fila de CSV con columnas partner_key,code o email,partner_key,code. */
export function parsePerksCsv(text: string): ParsedPerkRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const rows: ParsedPerkRow[] = [];
  let start = 0;

  const first = parseCsvLine(lines[0]).map((cell) => cell.toLowerCase());
  if (
    first.includes("partner_key") ||
    first.includes("partner") ||
    first.includes("email")
  ) {
    start = 1;
  }

  for (let i = start; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i]);
    if (cells.length < 2) continue;

    if (cells.length >= 3) {
      const [email, partnerKey, code] = cells;
      if (!partnerKey?.trim() || !code?.trim()) continue;
      rows.push({
        email: email.trim().toLowerCase(),
        partnerKey: partnerKey.trim().toLowerCase(),
        code: code.trim(),
      });
      continue;
    }

    const [partnerKey, code] = cells;
    if (!partnerKey?.trim() || !code?.trim()) continue;
    rows.push({
      partnerKey: partnerKey.trim().toLowerCase(),
      code: code.trim(),
    });
  }

  return rows;
}

/** Parser mínimo: comillas dobles y comas dentro de campos. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current);
  return cells.map((cell) => cell.trim());
}
