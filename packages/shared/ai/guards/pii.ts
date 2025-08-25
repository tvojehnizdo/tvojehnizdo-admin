export function maskPII(text: string) {
  return String(text)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "***@***")
    .replace(/\+?\d[\d\s-]{6,}\d/g, (m) => m[0] + "***" + m.slice(-1));
}
