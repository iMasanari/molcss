import { PluginItem } from '@babel/core'
import { createFilter, FilterPattern } from '@rollup/pluginutils'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import Transformer from './Transformer'

const STYLE_PATH = 'virtual:molcss/style.css'

interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  content: string | string[]
  babelPresets?: PluginItem[]
  babelPlugins?: PluginItem[]
  devLabel?: boolean
}

export default function molcss({ include, exclude, content, babelPresets, babelPlugins, devLabel }: Options): Plugin {
  const filter = createFilter(include || /\.(jsx?|tsx?|cjs|mjs)$/, exclude)

  const transformer = new Transformer()

  let config: ResolvedConfig
  let server: ViteDevServer | undefined

  transformer.subscribeShouldUpdate(async () => {
    if (!server || config.command !== 'serve') return

    const module = await server.moduleGraph.getModuleByUrl(`\0${STYLE_PATH}`)

    if (module) {
      server.reloadModule(module)
    }
  })

  return {
    name: 'molcss',
    configResolved(_config) {
      config = _config
    },
    configureServer(_server) {
      server = _server
    },
    resolveId(importee) {
      if (importee === STYLE_PATH || importee.startsWith(`${STYLE_PATH}?`)) {
        return `\0${importee}`
      }

      // NOTE: Astro requests path with `.../�virtual:molcss/style.css`
      if (importee.endsWith(`/�${STYLE_PATH}`)) {
        return `\0${STYLE_PATH}`
      }
    },
    async load(id) {
      if (id === `\0${STYLE_PATH}` || id.startsWith(`\0${STYLE_PATH}?`)) {
        await transformer.analyze(content)

        return transformer.getCss()
      }
    },
    async transform(input, id) {
      if (!filter(id)) {
        return
      }

      return await transformer.transform(input, { filename: id, babelPresets, babelPlugins, devLabel })
    },
  }
}
