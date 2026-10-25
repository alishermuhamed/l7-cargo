export function formatClientCode(code: number): string {
  const digits = String(Math.abs(code)).padStart(3, '0')
  return code < 0 ? `-${digits}` : digits
}
