import { BabelFileResult, transformAsync } from '@babel/core'
import { expect, it, describe } from 'vitest'
import plugin from '../src/babel-plugin'
import { createStyle, createStyleContext } from '../src/lib/style'

const createStyleFromActual = (actual: BabelFileResult) => {
  const styleData = (actual.metadata as any).molcss

  return createStyle(styleData)
}

describe('css tag', () => {
  it('css`...`', async () => {
    const code = `
      import { css } from "molcss";
      
      css\`
        color: red;
      \`;
    `

    const actual = await transformAsync(code, {
      plugins: [[plugin, { devLabel: false, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`""c0";"`)
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
      plugins: [[plugin, { devLabel: false, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      "const cssColor = 'blue';
      ({
        className: "c0 m0",
        runtime: [["bL", cssColor], ["bM", "1px solid " + cssColor]]
      });"
    `)

    expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
      ".m0{border:var(--molcss-bM)}
      .c0{color:var(--molcss-bL)}
      "
    `)
  })

  it('css same properties', async () => {
    const code = `
      import { css } from "molcss";
      
      css\`
        height: 100vh;
        height: 100dvh;
      \`;
    `

    const actual = await transformAsync(code, {
      plugins: [[plugin, { devLabel: false, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`""g0";"`)

    expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
      ".g0{height:100vh} .g0{height:100dvh}
      "
    `)
  })

  it('css same properties with runtime value', async () => {
    const code = `
      import { css } from "molcss";
      
      const value = 100;
      
      css\`
        height: \${value}vh;
        height: \${value}dvh;
      \`;
    `

    const actual = await transformAsync(code, {
      plugins: [[plugin, { devLabel: false, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      "const value = 100;
      ({
        className: "g0",
        runtime: [["bL", value + "vh"], ["bM", value + "dvh"]]
      });"
    `)

    expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
      ".g0{height:var(--molcss-bL)} .g0{height:var(--molcss-bM)}
      "
    `)
  })

  it('css @media and @supports', async () => {
    const code = `
      import { css } from "molcss";
      
      css\`
        @media screen and (min-width: 900px) {
          display: flex;
        }
      \`;

      css\`
        @supports (display: grid) {
          display: grid;
        }
      \`;
      
      css\`
        @supports (display: flex) {
          @media screen and (min-width: 900px) {
            display: flex;
          }
        }
      \`;
    `

    const actual = await transformAsync(code, {
      plugins: [[plugin, { devLabel: false, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      ""i0";
      "i1";
      "i2";"
    `)

    expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
      "@media screen and (min-width: 900px){.i0{display:flex}}
      @supports (display: grid){.i1{display:grid}}
      @supports (display: flex){@media screen and (min-width: 900px){.i2{display:flex}}}
      "
    `)
  })
})

describe('devLabel option', () => {
  it('devLabel option (identifier)', async () => {
    const code = `
      import { css } from "molcss";
      
      const identifierStyle = css\`
        color: red;
      \`;
    `

    const actual = await transformAsync(code, {
      filename: 'devLabel option (identifier)',
      plugins: [[plugin, { devLabel: true, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`"const identifierStyle = "DEV-devLabelOptionIdentifier-identifierStyle c0";"`)

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
      plugins: [[plugin, { devLabel: true, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      "const objectStyle = {
        identifierStyle: "DEV-devLabelOptionObject-identifierStyle c0",
        'literalStyle': "DEV-devLabelOptionObject-literalStyle c1"
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
      plugins: [[plugin, { devLabel: true, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      "function functionDeclaration() {
        "DEV-devLabelOptionFunction-functionDeclaration c0";
      }
      const _ = function functionExpression() {
        "DEV-devLabelOptionFunction-functionExpression c1";
      };
      const variableDeclaration = function () {
        "DEV-devLabelOptionFunction-variableDeclaration c2";
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
      plugins: [[plugin, { devLabel: true, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      "class ClassDeclaration {
        render() {
          "DEV-devLabelOptionClass-ClassDeclaration c0";
        }
      }
      const _ = class ClassExpression {
        render() {
          "DEV-devLabelOptionClass-ClassExpression c1";
        }
      };
      const VariableDeclaration = class {
        render() {
          "DEV-devLabelOptionClass-VariableDeclaration c2";
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
})

describe('createStyle', () => {
  it('order of style', async () => {
    const code = `
      import { css } from "molcss";
      
      css\`
        padding: 10px 1px;
        &:hover {
          padding: 10px 2px;
        }
        @media screen and (min-width: 300px) {
          padding: 10px 3px;
        }
        @media screen and (min-width: 600px) {
          padding: 10px 4px;
        }
      \`;

      css\`
        padding: 20px 1px;
        &:hover {
          padding: 20px 2px;
        }
        @media screen and (max-width: 600px) {
          padding: 20px 3px;
        }
        @media screen and (max-width: 300px) {
          padding: 20px 4px;
        }
      \`;
    `

    const actual = await transformAsync(code, {
      plugins: [[plugin, { devLabel: false, context: createStyleContext() }]],
    })

    expect(actual?.code).toMatchInlineSnapshot(`
      ""a0 a1a";
      "a2 a3a";"
    `)
    expect(createStyleFromActual(actual!)).toMatchInlineSnapshot(`
      ".a1a:hover{padding:10px 2px}
      .a3a:hover{padding:20px 2px}
      .a0{padding:10px 1px} @media screen and (min-width: 300px){.a0{padding:10px 3px}} @media screen and (min-width: 600px){.a0{padding:10px 4px}}
      .a2{padding:20px 1px} @media screen and (max-width: 600px){.a2{padding:20px 3px}} @media screen and (max-width: 300px){.a2{padding:20px 4px}}
      "
    `)
  })
})
