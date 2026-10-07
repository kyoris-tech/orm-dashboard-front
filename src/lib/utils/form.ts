export function isSameValue<T>(current: T, initial: T): boolean {
  return JSON.stringify(current) === JSON.stringify(initial);
}
