import postcss from 'postcss'
import { expect, test } from 'vitest'
import { createStyleContext } from '../src/lib/style'
import molcssPostcssPlugin from '../src/postcss-plugin'

test('postcss-plugin', async () => {
  const source = `
    @layer molcss;
  `

  const content = 'tests/assets/**/*.{ts,vue}'
  const context = createStyleContext()

  const processor = postcss(molcssPostcssPlugin({ content, context }))

  const result = await processor.process(source.trim(), {
    from: 'tests/postcss-plugin.test.css',
  })

  expect(result.css).toMatchInlineSnapshot(`".a0{padding:4px}.c1a:hover{color:blue}.c0{color:red}"`)
})
