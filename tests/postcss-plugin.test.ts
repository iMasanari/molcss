import postcss from 'postcss'
import { expect, test } from 'vitest'
import { createContext } from '../src/compiler/context'
import molcssPostcssPlugin from '../src/compiler/postcss-plugin'

test('postcss-plugin', async () => {
  const source = `
    @layer molcss;
  `

  const content = 'tests/assets/**/*.{ts,vue}'
  const context = createContext()

  const processor = postcss(molcssPostcssPlugin({ content, context }))

  const result = await processor.process(source.trim(), {
    from: 'tests/postcss-plugin.test.css',
  })

  expect(result.css).toMatchInlineSnapshot(`".a0{padding:4px}.c0{color:red}.c1:hover{color:blue}"`)
})
