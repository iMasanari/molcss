import { transformAsync } from '@babel/core'
import { expect, it } from 'vitest'
import plugin from '../src/babel-plugin'

it('css`...`', async () => {
  const code = `
    import { css } from "molcss";
    
    css\`
      color: red;
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, {}]],
  })

  const classNames = [...(actual?.metadata as any).molcss.keys()]

  expect(classNames.length).toBe(1)
  expect(classNames).matchSnapshot()
  expect(actual?.code).matchSnapshot()
})

it('css`${...}`', async () => {
  const code = `
    import { css } from "molcss";
    
    const cssColor = 'blue';
    
    css\`
      color: \${cssColor};
      border: 1px solid \${cssColor};
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, {}]],
  })

  expect(actual?.code).matchSnapshot()
})
