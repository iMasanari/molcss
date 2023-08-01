import { transformAsync } from '@babel/core'
import { expect, it } from 'vitest'
import plugin from '../src/babel-plugin'

it('tw`...`', async () => {
  const code = `
    import { css } from "molcss";
    
    css\`
      color: red;
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [plugin],
  })

  const className = [...(actual?.metadata as any).molcss.keys()].join(' ')

  expect(actual?.code).toBe(JSON.stringify(className) + ';')
})
