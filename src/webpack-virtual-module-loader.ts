import type { LoaderContext } from 'webpack'

interface Options {
  content: string | (() => string)
}

export default function molcssVirtualModuleLoader(this: LoaderContext<Options>) {
  const { content } = this.getOptions()

  this.cacheable(false)

  return typeof content === 'function' ? content() : content
}
