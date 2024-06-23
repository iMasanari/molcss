import { BabelFileResult, transformAsync } from '@babel/core'
import { expect, it, describe } from 'vitest'
import plugin from '../src/compiler/babel-plugin'
import { createContext } from '../src/compiler/context'
import { createStyle } from '../src/compiler/lib/style'

const formatActual = (actual: BabelFileResult | null) => {
  if (!actual) {
    return ''
  }

  const styleData = (actual.metadata as any).molcss

  return `--- js ---
${actual.code ?? ''}

--- css ---
${createStyle(styleData)}`
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
      plugins: [[plugin, { devLabel: false, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      "c0";

      --- css ---
      .c0{color:red}
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
      plugins: [[plugin, { devLabel: false, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      const cssColor = 'blue';
      ({
        className: "c0 m0",
        runtime: [["bL", cssColor], ["bM", "1px solid " + cssColor]]
      });

      --- css ---
      .m0{border:var(--molcss-bM)}
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
        &:hover {
          height: 1px;
        }
        &[data-hover] {
          height: 2px;
        }
        & span {
          height: 1%;
        }
      \`;
    `

    const actual = await transformAsync(code, {
      plugins: [[plugin, { devLabel: false, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      "g0 g1a";

      --- css ---
      .g0{height:100vh} .g0{height:100dvh} .g0:hover{height:1px} .g0[data-hover]{height:2px}
      .g1a span{height:1%}
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
      plugins: [[plugin, { devLabel: false, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      const value = 100;
      ({
        className: "g0",
        runtime: [["bL", value + "vh"], ["bM", value + "dvh"]]
      });

      --- css ---
      .g0{height:var(--molcss-bL)} .g0{height:var(--molcss-bM)}
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
      plugins: [[plugin, { devLabel: false, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      "i0";
      "i1";
      "i2";

      --- css ---
      @media screen and (min-width: 900px){.i0{display:flex}}
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
      plugins: [[plugin, { devLabel: true, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      const identifierStyle = "__DEV-devLabelOptionIdentifier-identifierStyle__ c0";

      --- css ---
      .c0{color:red}
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
      plugins: [[plugin, { devLabel: true, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      const objectStyle = {
        identifierStyle: "__DEV-devLabelOptionObject-identifierStyle__ c0",
        'literalStyle': "__DEV-devLabelOptionObject-literalStyle__ c1"
      };

      --- css ---
      .c0{color:red}
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
      plugins: [[plugin, { devLabel: true, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      function functionDeclaration() {
        "__DEV-devLabelOptionFunction-functionDeclaration__ c0";
      }
      const _ = function functionExpression() {
        "__DEV-devLabelOptionFunction-functionExpression__ c1";
      };
      const variableDeclaration = function () {
        "__DEV-devLabelOptionFunction-variableDeclaration__ c2";
      };

      --- css ---
      .c0{color:red}
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
      plugins: [[plugin, { devLabel: true, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      class ClassDeclaration {
        render() {
          "__DEV-devLabelOptionClass-ClassDeclaration__ c0";
        }
      }
      const _ = class ClassExpression {
        render() {
          "__DEV-devLabelOptionClass-ClassExpression__ c1";
        }
      };
      const VariableDeclaration = class {
        render() {
          "__DEV-devLabelOptionClass-VariableDeclaration__ c2";
        }
      };

      --- css ---
      .c0{color:red}
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
      plugins: [[plugin, { devLabel: false, context: createContext() }]],
    })

    expect(formatActual(actual)).toMatchInlineSnapshot(`
      "--- js ---
      "a0";
      "a1";

      --- css ---
      .a0{padding:10px 1px} .a0:hover{padding:10px 2px} @media screen and (min-width: 300px){.a0{padding:10px 3px}} @media screen and (min-width: 600px){.a0{padding:10px 4px}}
      .a1{padding:20px 1px} .a1:hover{padding:20px 2px} @media screen and (max-width: 600px){.a1{padding:20px 3px}} @media screen and (max-width: 300px){.a1{padding:20px 4px}}
      "
    `)
  })
})

it('css`...`', async () => {
  const code = `
    import { css } from "molcss";
    
    css\`
      color: red;
    \`;

    css\`
      &:hover {
        color: red;
      }
    \`;

    css\`
      &::after {
        color: red;
      }
    \`;

    css\`
      & div {
        color: red;
      }
    \`;

    css\`
      color: red;
      &:hover {
        color: red;
      }
      &::after {
        color: red;
      }
      & div {
        color: red;
      }
    \`;
  `

  const actual = await transformAsync(code, {
    plugins: [[plugin, { devLabel: false, context: createContext() }]],
  })

  expect(formatActual(actual)).toMatchInlineSnapshot(`
    "--- js ---
    "c0";
    "c1";
    "c2a";
    "c3b";
    "c4 c2a c3b";

    --- css ---
    .c0{color:red}
    .c1:hover{color:red}
    .c4{color:red} .c4:hover{color:red}
    .c2a::after{color:red}
    .c3b div{color:red}
    "
  `)
})
