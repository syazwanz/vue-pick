let counter = 0

export function generateId(prefix = "vpick"): string {
  return `${prefix}-${++counter}`
}

export function resetIdCounter(): void {
  counter = 0
}
