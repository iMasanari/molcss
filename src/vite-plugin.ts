import { createFilter, FilterPattern } from '@rollup/pluginutils'
import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import Transformer from './Transformer'

const STYLE_PATH = 'virtual:molcss/style.css'

interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  content: string | string[]
}

export default function molcss({ include, exclude, content }: Options): Plugin {
  const filter = createFilter(include || /\.(jsx?|tsx?|cjs|mjs)$/, exclude)

  const transformer = new Transformer()

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

      await transformer.analyze(content)

      return transformer.getCss()
    },
    async transform(input, id) {
      if (!filter(id)) {
        return
      }

      const result = await transformer.transform(input)

      if (server && transformer.shouldUpdate()) {
        const module = await server.moduleGraph.getModuleByUrl(`\0${STYLE_PATH}`)

        if (module) {
          server.reloadModule(module)
        }
      }

      return result
    },
  }
}
