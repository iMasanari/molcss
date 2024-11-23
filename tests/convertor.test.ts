import { expect, test } from 'vitest'
import { convertToAlphabet } from '../src/utils/convertor'

test.each([
  { input: 0, expected: 'a' },
  { input: 1, expected: 'b' },
  { input: 25, expected: 'z' },
  { input: 26, expected: 'A' },
  { input: 51, expected: 'Z' },
  { input: 52 * 1, expected: 'aa' },
  { input: 52 * 1 + 51, expected: 'aZ' },
  { input: 52 * 2, expected: 'ba' },
  { input: 52 * 52 + 51, expected: 'ZZ' },
  { input: 52 * 53, expected: 'aaa' },
])('convert $input to $expected', ({ input, expected }) => {
  const actual = convertToAlphabet(input)

  expect(actual).toBe(expected)
})
