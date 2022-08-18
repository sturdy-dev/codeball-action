// eq is an equality check, but treats null and undefined as equal
export const eq = (
  a: number | undefined | null | string,
  b: number | undefined | null | string
): boolean => {
  if (a === null) {
    a = undefined
  }
  if (b === null) {
    b = undefined
  }
  return a === b
}
