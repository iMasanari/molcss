import { type NodePath, type PluginObj, type types as t } from '@babel/core'
import { mergeStyle } from './client'
import { StyleData, parse } from './lib/css-parser'
import { StyleContext, createClassName, createStyleContext } from './lib/style'

const PACKAGE_NAME = 'molcss'
const IMPORTED_NAME = 'css'

type BabelTypes = typeof t

interface PluginOptions {
  types: BabelTypes
}

interface MolcssOptions {
  context?: StyleContext
}

const removeUnusedImports = (path: NodePath<t.ImportSpecifier>) => {
  const binding = path.scope.getBinding(path.node.local.name)

  if (!binding || binding.referencePaths.length !== 0) {
    return
  }

  path.remove()

  const parent = path.parentPath

  if (parent.isImportDeclaration() && parent.node.specifiers.length === 0) {
    parent.remove()
  }
}

export default ({ types: t }: PluginOptions, options: MolcssOptions = {}): PluginObj => {
  const styleContext = options.context || createStyleContext()
  const styleMap = new Map<string, StyleData>()

  return {
    name: 'molcss/babel-plugin',
    visitor: {
      ImportSpecifier(path, state) {
        if (path.parent.type !== 'ImportDeclaration' || path.parent.source.value !== PACKAGE_NAME) {
          return
        }

        const importedName = t.isStringLiteral(path.node.imported)
          ? path.node.imported.value
          : path.node.imported.name

        if (importedName !== IMPORTED_NAME) {
          return
        }

        const binding = path.scope.getBinding(path.node.local.name)

        if (!binding) {
          return
        }

        for (const ref of binding.referencePaths) {
          const target = ref.parentPath

          if (!target?.isTaggedTemplateExpression()) {
            continue
          }

          let style = ''
          const quasiMap = new Map<string, t.Expression>()

          for (const [i, v] of target.node.quasi.quasis.entries()) {
            style += v.value.cooked

            if (!v.tail) {
              const key = `__MOLCSS_VALUE_${i}__`
              style += key
              quasiMap.set(key, target.node.quasi.expressions[i] as t.Expression)
            }
          }

          const result = parse(style)

          const runtimeStyleList = []

          for (const styleData of result) {
            for (const [index, value] of styleData.value.entries()) {
              const list = value.split(/(__MOLCSS_VALUE_\d+__)/)

              if (list.length > 1) {
                const token = createClassName({ ...styleData, value: [] }, styleContext)
                const classProp = createClassName({ prop: `--molcss-${token}`, value: [], selector: '&\f', media: '' }, styleContext).replace(/\d+$/, '')

                const expressions = list.filter(Boolean).map(v => quasiMap.get(v) ?? t.stringLiteral(v))

                const expression = expressions.length === 1
                  ? expressions[0]!
                  : expressions.reduce((acc, v) => t.binaryExpression('+', acc, v))

                styleData.value[index] = `var(--molcss-${classProp})`

                runtimeStyleList.push({
                  prop: classProp,
                  expression,
                })
              }
            }
          }

          const classNames = result.map(v => createClassName(v, styleContext))

          for (const [i, style] of result.entries()) {
            styleMap.set(classNames[i]!, style)
          }

          const className = mergeStyle(...classNames)

          if (runtimeStyleList.length) {
            const node = t.objectExpression([
              t.objectProperty(t.identifier('className'), t.stringLiteral(className)),
              t.objectProperty(t.identifier('runtime'),
                t.arrayExpression(runtimeStyleList.map(v =>
                  t.arrayExpression([t.stringLiteral(v.prop), v.expression])
                )),
              ),
            ])

            target.replaceWith(node)
          } else {
            target.replaceWith(t.stringLiteral(className))
          }
        }

        path.scope.crawl()
        removeUnusedImports(path)
      },
    },
    post(file) {
      const metadata = file.metadata as { [PACKAGE_NAME]: Map<string, StyleData> }

      metadata[PACKAGE_NAME] = styleMap
    },
  }
}
