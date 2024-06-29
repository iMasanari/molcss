import molcss from 'molcss/nextjs-plugin'

const withMolcss = molcss({
  content: 'src/**/*.{js,jsx,ts,tsx}',
})

export default withMolcss({
  output: 'export',
  trailingSlash: true,
})
