import { transformAsync } from '@babel/core'
import molcssBabelPlugin from './babel-plugin'
import { StyleData } from './lib/css-parser'
import { correctStyleData, createClassName, createStyle, createStyleContext } from './lib/style'

const PACKAGE_NAME = 'molcss'

export default class Transformer {
  private _context = createStyleContext()
  private _styleMap = new Map<string, StyleData>()
  private _unknownClassNames: string[] = []

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

  async transform(input: string) {
    const result = await transformAsync(input, {
      plugins: [[molcssBabelPlugin, { context: this._context }]],
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

    for (const [className] of styles) {
      if (!this._styleMap.has(className)) {
        this._unknownClassNames.push(className)
      }
    }

    return { code, map }
  }

  shouldUpdate() {
    return !!this._unknownClassNames.length
  }
}
