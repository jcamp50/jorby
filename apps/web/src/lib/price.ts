/** Convert Ontology minor units (Long string or number) into a major-unit amount. */
export function minorUnitsToMajor(minorUnits: string | number, currency: string): number {
  const units = typeof minorUnits === 'string' ? Number(minorUnits) : minorUnits
  if (!Number.isFinite(units)) {
    return 0
  }
  const digits =
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions()
      .minimumFractionDigits ?? 2
  return units / 10 ** digits
}

export function majorToMinorUnits(major: number, currency: string): string {
  const digits =
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions()
      .minimumFractionDigits ?? 2
  return String(Math.round(major * 10 ** digits))
}
