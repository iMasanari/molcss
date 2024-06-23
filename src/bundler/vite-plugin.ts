import { transformAsync } from '@babel/core'
import { FilterPattern, createFilter } from '@rollup/pluginutils'
import postcss from 'postcss'
import type { PluginOption, ResolvedConfig, ViteDevServer } from 'vite'
import molcssBabelPlugin from '../compiler/babel-plugin'
import { createContext } from '../compiler/context'
import postcssPlugin from '../compiler/postcss-plugin'

interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  content: string | string[]
}

const molcss = ({ include, exclude, content }: Options): PluginOption => {
  const filter = createFilter(include ?? content, exclude)
  const styleFilter = createFilter('**/molcss/style.css')

  const context = createContext()

  let config: ResolvedConfig | undefined
  let server: ViteDevServer | undefined

  const styleModuleIds = new Set<string>()

  return [{
    name: 'molcss/script',
    configResolved(_config) {
      config = _config
    },
    configureServer(_server) {
      server = _server
    },
    async transform(input, id) {
      if (!filter(id)) {
        return
      }

      const result = await transformAsync(input, {
        filename: id,
        plugins: [
          [molcssBabelPlugin, { context }],
        ],
        sourceMaps: true,
      })

      if (!result || !result.code) {
        return input
      }

      if (server && config?.command === 'serve' && (result.metadata as any)?.molcss) {
        for (const id of styleModuleIds) {
          const module = server.moduleGraph.getModuleById(id)

          if (module) {
            server.reloadModule(module)
          } else {
            styleModuleIds.delete(id)
          }
        }
      }

      return { code: result.code, map: result.map }
    },
  }, {
    name: 'molcss/style',
    enforce: 'pre',
    async transform(code, id) {
      if (!styleFilter(id)) {
        return
      }

      const result = await postcss([postcssPlugin({ content, context })]).process(code, { from: undefined })

      if (server && config?.command === 'serve') {
        styleModuleIds.add(id)
      }

      return { code: result.css, map: result.map?.toString() }
    },
  }]
}

export default molcss
