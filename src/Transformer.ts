import { transformAsync } from '@babel/core'
import molcssBabelPlugin from './babel-plugin'
import { StyleData } from './lib/css-parser'
import { correctStyleData, createClassName, createStyle, createStyleContext } from './lib/style'

const PACKAGE_NAME = 'molcss'

export default class Transformer {
  private _context = createStyleContext()
  private _styleMap = new Map<string, StyleData>()
  private _unknownClassNames: string[] = []
  private _updateListeners = new Set<() => void>()

  async analyze(content: string | string[]) {
    const styles = await correctStyleData(content)

    for (const style of styles) {
      this._styleMap.set(createClassName(style, this._context), style)
    }

    this._unknownClassNames = this._unknownClassNames.filter(v => !this._styleMap.has(v))
  }

  getCss() {
    return createStyle(this._styleMap)
  }

  async transform(input: string, inputSourceMap?: any) {
    const result = await transformAsync(input, {
      plugins: [[molcssBabelPlugin, { context: this._context }]],
      inputSourceMap: inputSourceMap,
      sourceMaps: true,
    })

    let { code, map, metadata } = result!

    if (!code) {
      return
    }

    const styles = (metadata as any)[PACKAGE_NAME] as Map<string, StyleData> | undefined

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
