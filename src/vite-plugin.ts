import { transformAsync } from '@babel/core'
import { createFilter, FilterPattern } from '@rollup/pluginutils'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import molcssBabelPlugin from './babel-plugin'
import { StyleData } from './lib/css-parser'
import { correctStyleData, createClassName, createStyle, createStyleContext } from './lib/style'

const PACKAGE_NAME = 'molcss'
const STYLE_PATH = 'virtual:molcss/style.css'

interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  content: string | string[]
}

export default function molcss({ include, exclude, content }: Options): Plugin {
  const filter = createFilter(include || /\.(jsx?|tsx?|cjs|mjs)$/, exclude)

  const styleContext = createStyleContext()
  const styleMap = new Map<string, StyleData>()

  let config: ResolvedConfig
  let server: ViteDevServer | undefined

  return {
    name: 'molcss',
    configResolved(_config) {
      config = _config
    },
    configureServer(_server) {
      server = _server
    },
    resolveId(importee) {
      return importee === STYLE_PATH ? `\0${STYLE_PATH}` : null
    },
    async load(id) {
      if (id !== `\0${STYLE_PATH}`) {
        return null
      }

      const styles = await correctStyleData(content)

      styles.forEach((style) => {
        styleMap.set(createClassName(style, styleContext), style)
      })

      return createStyle(styleMap)
    },
    async transform(input, id) {
      if (!filter(id)) {
        return
      }

      const result = await transformAsync(input, {
        plugins: [[molcssBabelPlugin, { context: styleContext }]],
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

      const size = styleMap.size

      styles.forEach((style, key) => {
        styleMap.set(key, style)
      })

      if (server && styleMap.size !== size) {
        const module = await server.moduleGraph.getModuleByUrl(`\0${STYLE_PATH}`)

        if (module) {
          server.reloadModule(module)
        }
      }

      return { code, map }
    },
  }
}
