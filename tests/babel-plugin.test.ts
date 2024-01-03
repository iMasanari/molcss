import { BabelFileResult, transformAsync } from '@babel/core'
import { expect, it } from 'vitest'
import plugin from '../src/babel-plugin'
import { createStyle } from '../src/lib/style'

const createStyleFromActual = (actual: BabelFileResult) => {
  const styleData = (actual.metadata as any).molcss

  return createStyle(styleData)
}

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

  expect(actual?.code).toMatchInlineSnapshot('"\\"c0\\";"')
  expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
    ".c0{color:red}
    "
  `)
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

  expect(actual?.code).toMatchInlineSnapshot(`
    "const cssColor = 'blue';
    ({
      className: \\"c0 m0\\",
      runtime: [[\\"bL\\", cssColor], [\\"bM\\", \\"1px solid \\" + cssColor]]
    });"
  `)

  expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
    ".m0{border:var(--molcss-bM)}
    .c0{color:var(--molcss-bL)}
    "
  `)
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

  expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
    ".c0{color:red}
    "
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

  expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
    ".c0{color:red}
    .c1{color:green}
    "
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

  expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
    ".c0{color:red}
    .c1{color:green}
    .c2{color:blue}
    "
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

  expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
    ".c0{color:red}
    .c1{color:green}
    .c2{color:blue}
    "
  `)
})
