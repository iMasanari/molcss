import { readFile } from 'node:fs/promises'
import { glob } from 'fast-glob'
import { type Plugin } from 'postcss'
import { StyleData } from './lib/css-parser'
import { extract } from './lib/extractor'
import { parseTagTemplate } from './lib/parse-tag-template'
import { StyleContext, createClassName, createStyle } from './lib/style'

interface Options {
  content: string | string[]
  context: StyleContext
}

const correctStyleData = async (files: string[], context: StyleContext) => {
  return files.flatMap(v =>
    extract(v, 'css').flatMap(v => parseTagTemplate(v.quasis, [], context).styles)
  )
}

const molcssPostcssPlugin = (options: Options): Plugin => {
  const { content, context } = options
  const baseDir = process.cwd()

  const styles = new Map<string, StyleData>()

  return {
    postcssPlugin: 'molcss-assets-plugin',
    AtRule: {
      async layer(atRule, { result }) {
        if (atRule.params !== 'molcss') {
          return
        }

        const paths = await glob(content)

        const files = await Promise.all(
          paths.map((path) => readFile(path, 'utf-8'))
        )

        const contentList = Array.isArray(content) ? content : [content]

        contentList.forEach(path => {
          result.messages.push({
            type: 'dir-dependency',
            dir: baseDir,
            glob: path,
            parent: result.opts.from,
          })
        })

        const styleData = await correctStyleData(files, context)

        styleData.forEach(v => {
          styles.set(createClassName(v, context), v)
        })

        const css = createStyle(styles)

        atRule.after(css)
        atRule.remove()
      },
    },
  }
}

molcssPostcssPlugin.postcss = true

export default molcssPostcssPlugin
