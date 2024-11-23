const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const base = 52

export function convertToAlphabet(num: number) {
  let result = ''
  let target = num

  while (target >= 0) {
    const remainder = target % base

    result = characters.charAt(remainder) + result
    target = Math.floor(target / base) - 1
  }

  return result
}
