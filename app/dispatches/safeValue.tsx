// Returns a value that is always safe to render as a React child (never an object or array)
export function safeValue(val: any, fallback: string = "-"): string {
  if (val == null) return fallback;
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    if (Array.isArray(val)) return fallback;
    if (typeof val.name === "string") return val.name;
    if (typeof val.title === "string") return val.title;
    if (typeof val.id === "number" || typeof val.id === "string") return String(val.id);
    return fallback;
  }
  return fallback;
}
