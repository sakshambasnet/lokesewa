const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/** Converts ASCII digits to Nepali digits: 2083 → "२०८३". Other characters stay the same. */
export function toNepaliDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => NEPALI_DIGITS[Number(d)] ?? d);
}
