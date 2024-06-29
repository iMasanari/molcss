import molcss from 'molcss/nextjs-plugin'

const withMolcss = molcss({
  content: 'src/**/*.{js,jsx,ts,tsx}',
})

export default withMolcss({
  basePath: process.env.BASE_PATH,
  output: 'export',
  trailingSlash: true,
})
