// Minimal CSV parser that handles quoted fields with commas and escaped quotes.
// Designed for the provided prototype datasets (header row + data rows).
export function parseCsv<T extends Record<string, unknown>>(csvText: string): T[] {
  const rows = splitCsvRows(csvText);
  if (rows.length === 0) return [];

  const header = splitCsvRow(rows[0]);
  const out: T[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = splitCsvRow(rows[i]);
    if (cols.length === 1 && cols[0] === "") continue;

    const rowObj: Record<string, unknown> = {};
    for (let h = 0; h < header.length; h++) {
      rowObj[header[h]] = cols[h] ?? "";
    }
    out.push(rowObj as T);
  }

  return out;
}

function splitCsvRows(csvText: string): string[] {
  // Keep line breaks inside quoted fields; so we parse character-by-character.
  const rows: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];

    if (ch === '"') {
      // Handle escaped quote ("")
      const next = csvText[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++; // skip next quote
        continue;
      }
      inQuotes = !inQuotes;
      current += ch;
      continue;
    }

    // Row delimiter
    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      // Consume \r\n as one newline
      if (ch === "\r" && csvText[i + 1] === "\n") i++;
      rows.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  // Flush last row
  if (current.length > 0) rows.push(current);
  return rows;
}

function splitCsvRow(rowText: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < rowText.length; i++) {
    const ch = rowText[i];

    if (ch === '"') {
      const next = rowText[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue; // do not include quote chars
    }

    if (ch === "," && !inQuotes) {
      cols.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  cols.push(current);
  return cols.map((c) => c.trim());
}

