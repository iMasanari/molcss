import { readFile } from 'node:fs/promises'
import { BabelFileMetadata, PluginItem, transformAsync } from '@babel/core'
import glob from 'fast-glob'
import molcssBabelPlugin from './babel-plugin'
import { StyleData } from './lib/css-parser'
import { extract } from './lib/extractor'
import { parseTagTemplate } from './lib/parse-tag-template'
import { StyleContext, createClassName, createStyle, createStyleContext } from './lib/style'

const PACKAGE_NAME = 'molcss'

export interface TransformOptions {
  babelPresets?: PluginItem[]
  babelPlugins?: PluginItem[]
}

interface BabelMetaDataWithMolcss extends BabelFileMetadata {
  [PACKAGE_NAME]: Map<string, StyleData> | undefined
}

const correctStyleData = async (content: string | string[], context: StyleContext) => {
  const paths = await glob(content)

  const files = await Promise.all(
    paths.map((path) => readFile(path, 'utf-8'))
  )

  return files.flatMap(v =>
    extract(v, 'css').flatMap(v => parseTagTemplate(v.quasis, [], context).styles)
  )
}

export default class Transformer {
  private _context = createStyleContext()
  private _styleMap = new Map<string, StyleData>()
  private _unknownClassNames: string[] = []
  private _updateListeners = new Set<() => void>()

  async analyze(content: string | string[]) {
    const styles = await correctStyleData(content, this._context)

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
