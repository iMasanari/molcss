import { readFile } from 'node:fs/promises'
import { BabelFileMetadata, PluginItem, transformAsync } from '@babel/core'
// @ts-ignore
import typescriptSyntaxBabelPlugin from '@babel/plugin-syntax-typescript'
import glob from 'fast-glob'
import molcssBabelPlugin from './babel-plugin'
import { StyleData } from './lib/css-parser'
import { StyleContext, createClassName, createStyle, createStyleContext } from './lib/style'

const PACKAGE_NAME = 'molcss'

export interface TransformOptions {
  babelPresets?: PluginItem[]
  babelPlugins?: PluginItem[]
}

interface BabelMetaDataWithMolcss extends BabelFileMetadata {
  [PACKAGE_NAME]: Map<string, StyleData> | undefined
}

const correctStyleData = async (content: string | string[], context: StyleContext, { babelPlugins, babelPresets }: TransformOptions) => {
  const paths = await glob(content)

  const files = await Promise.all(paths.map(async (path) => {
    const source = await readFile(path, 'utf-8')

    if (!/\bmolcss\b/.test(source)) {
      return []
    }

    const result = await transformAsync(source, {
      plugins: [
        ...(babelPlugins || []),
        [typescriptSyntaxBabelPlugin, { isTSX: true }],
        [molcssBabelPlugin, { context }],
      ],
      presets: babelPresets,
      sourceMaps: true,
    })

    const { metadata } = result!
    const styles = (metadata as BabelMetaDataWithMolcss)[PACKAGE_NAME]

    return styles ? Array.from(styles.values()) : []
  }))

  return files.flat()
}

export default class Transformer {
  private _context = createStyleContext()
  private _styleMap = new Map<string, StyleData>()
  private _unknownClassNames: string[] = []
  private _updateListeners = new Set<() => void>()

  async analyze(content: string | string[], options: TransformOptions) {
    const styles = await correctStyleData(content, this._context, options)

    for (const style of styles) {
      this._styleMap.set(createClassName(style, this._context), style)
    }

    this._unknownClassNames = this._unknownClassNames.filter(v => !this._styleMap.has(v))
  }

  getCss() {
    return createStyle(this._styleMap)
  }

  async transform(input: string, { babelPlugins, babelPresets }: TransformOptions) {
    const result = await transformAsync(input, {
      plugins: [
        ...(babelPlugins || []),
        [typescriptSyntaxBabelPlugin, { isTSX: true }],
        [molcssBabelPlugin, { context: this._context }],
      ],
      presets: babelPresets,
      sourceMaps: true,
    })

    let { code, map, metadata } = result!

    if (!code) {
      return
    }

    const styles = (metadata as BabelMetaDataWithMolcss)[PACKAGE_NAME]

    if (!styles) {
      return
    }

    let shouldUpdate = false

    for (const [className] of styles) {
      if (!this._styleMap.has(className)) {
        shouldUpdate = true
        this._unknownClassNames.push(className)
      }
    }

    if (shouldUpdate) {
      this._updateListeners.forEach(fn => fn())
    }

    return { code, map }
  }

  subscribeShouldUpdate(fn: () => void) {
    this._updateListeners.add(fn)

    return () => this._updateListeners.delete(fn)
  }
}
