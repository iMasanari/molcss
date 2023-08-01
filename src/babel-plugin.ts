import { type NodePath, type PluginObj, type types as t } from '@babel/core'
import { mergeStyle } from './client'
import { StyleData, parse } from './lib/css-parser'
import { createClassName, createStyleContext } from './lib/style'

const PACKAGE_NAME = 'molcss'
const IMPORTED_NAME = 'css'

type BabelTypes = typeof t

interface PluginOptions {
  types: BabelTypes
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

export default ({ types: t }: PluginOptions, options: any = {}): PluginObj => {
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

          const style = target.node.quasi.quasis[0]?.value.cooked || ''
          const result = parse(style)
          const classNames = result.map(v => createClassName(v, styleContext))

          for (const [i, style] of result.entries()) {
            styleMap.set(classNames[i]!, style)
          }

          const className = mergeStyle(...classNames)

          target.replaceWith(t.stringLiteral(className))
        }

        path.scope.crawl()
        removeUnusedImports(path)
      },
    },
    pre(file) {
      const metadata = file.metadata as { molcss: any }

      metadata[PACKAGE_NAME] = styleMap
    },
  }
}
