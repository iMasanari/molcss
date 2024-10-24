import nextMDX from '@next/mdx'
import rehypeShiki from '@shikijs/rehype'
import molcss from 'molcss/nextjs-plugin'

const plugins = [
  nextMDX({
    options: {
      rehypePlugins: [
        [rehypeShiki, { theme: 'dark-plus' }],
      ],
    },
  }),
  molcss({
    content: 'src/**/*.{js,jsx,ts,tsx}',
  }),
]

export default plugins.reduce((config, fn) => fn(config), {
  basePath: process.env.BASE_PATH,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  output: 'export',
  trailingSlash: true,
})
