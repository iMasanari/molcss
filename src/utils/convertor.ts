const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const base = 52

export function convertToAlphabet(num: number) {
  let result = ''
  let target = num + 1

  while (target > 0) {
    const remainder = (target - 1) % base

    result = characters.charAt(remainder) + result
    target = Math.floor((target - 1) / base)
  }

  return result
}
