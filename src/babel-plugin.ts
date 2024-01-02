import { type NodePath, type PluginObj, type types as t } from '@babel/core'
import { mergeStyle } from './client'
import { StyleData, parse } from './lib/css-parser'
import { parseTagTemplate } from './lib/parse-tag-template'
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
      ImportSpecifier(path) {
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

          const result = parseTagTemplate(
            target.node.quasi.quasis.map(v => v.value.cooked || ''),
            target.node.quasi.expressions as t.Expression[],
            styleContext,
          )

          const classNames = result.styles.map(v => createClassName(v, styleContext))

          for (const [i, style] of result.styles.entries()) {
            styleMap.set(classNames[i]!, style)
          }

          const className = mergeStyle(...classNames)

          if (result.runtimeStyles.length) {
            const node = t.objectExpression([
              t.objectProperty(t.identifier('className'), t.stringLiteral(className)),
              t.objectProperty(t.identifier('runtime'),
                t.arrayExpression(result.runtimeStyles.map(v => {
                  const expressions = v.expressions.filter(Boolean).map(w => typeof w === 'string' ? t.stringLiteral(w) : w)

                  const expression = expressions.length === 1
                    ? expressions[0]!
                    : expressions.reduce((acc, v) => t.binaryExpression('+', acc, v))

                  return t.arrayExpression([t.stringLiteral(v.prop), expression])
                })),
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
