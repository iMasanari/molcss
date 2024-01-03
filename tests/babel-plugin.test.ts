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
    plugins: [[plugin, { devLabel: false }]],
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
    plugins: [[plugin, { devLabel: false }]],
  })

  expect(actual?.code).matchSnapshot()
})

it('devLabel option (identifier)', async () => {
  const code = `
    import { css } from "molcss";
    
    const identifierStyle = css\`
      color: red;
    \`;
  `

  const actual = await transformAsync(code, {
    filename: 'devLabel option (identifier)',
    plugins: [[plugin, { devLabel: true }]],
  })

  expect(actual?.code).toMatchInlineSnapshot(`
    "const identifierStyle = \\"DEV-devLabelOptionIdentifier-identifierStyle c0\\";"
  `)
})

it('devLabel option (object)', async () => {
  const code = `
    import { css } from "molcss";

    const objectStyle = {
      identifierStyle: css\`
        color: red;
      \`,
      'literalStyle': css\`
        color: green;
      \`,
    }
  `

  const actual = await transformAsync(code, {
    filename: 'devLabel option (object)',
    plugins: [[plugin, { devLabel: true }]],
  })

  expect(actual?.code).toMatchInlineSnapshot(`
    "const objectStyle = {
      identifierStyle: \\"DEV-devLabelOptionObject-identifierStyle c0\\",
      'literalStyle': \\"DEV-devLabelOptionObject-literalStyle c1\\"
    };"
  `)
})

it('devLabel option (function)', async () => {
  const code = `
    import { css } from "molcss";

    function functionDeclaration() {
      css\`
        color: red;
      \`
    }

    const _ = function functionExpression() {
      css\`
        color: green;
      \`
    }

    const variableDeclaration = function () {
      css\`
        color: blue;
      \`
    }
  `

  const actual = await transformAsync(code, {
    filename: 'devLabel option (function).js',
    plugins: [[plugin, { devLabel: true }]],
  })

  expect(actual?.code).toMatchInlineSnapshot(`
    "function functionDeclaration() {
      \\"DEV-devLabelOptionFunction-functionDeclaration c0\\";
    }
    const _ = function functionExpression() {
      \\"DEV-devLabelOptionFunction-functionExpression c1\\";
    };
    const variableDeclaration = function () {
      \\"DEV-devLabelOptionFunction-variableDeclaration c2\\";
    };"
  `)
})

it('devLabel option (class)', async () => {
  const code = `
    import { css } from "molcss";

    class ClassDeclaration {
      render() {
        css\`
          color: red;
        \`
      }
    }

    const _ = class ClassExpression {
      render() {
        css\`
          color: green;
        \`
      }
    }

    const VariableDeclaration = class {
      render() {
        css\`
          color: blue;
        \`
      }
    }
  `

  const actual = await transformAsync(code, {
    filename: 'devLabel option (class).js',
    plugins: [[plugin, { devLabel: true }]],
  })

  expect(actual?.code).toMatchInlineSnapshot(`
    "class ClassDeclaration {
      render() {
        \\"DEV-devLabelOptionClass-ClassDeclaration c0\\";
      }
    }
    const _ = class ClassExpression {
      render() {
        \\"DEV-devLabelOptionClass-ClassExpression c1\\";
      }
    };
    const VariableDeclaration = class {
      render() {
        \\"DEV-devLabelOptionClass-VariableDeclaration c2\\";
      }
    };"
  `)
})
