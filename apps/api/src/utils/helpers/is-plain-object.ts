type PlainObject = Record<string, unknown>

export function isPlainObject(value: unknown): value is PlainObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  return Object.getPrototypeOf(value) === Object.prototype
}
