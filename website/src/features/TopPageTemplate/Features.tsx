import { readFile } from 'node:fs/promises'
import { css } from 'molcss'
import CodeArea from '../CodeArea/CodeArea'

const rootStyle = css`
  display: flex;
  gap: 8px;
  margin: 0 auto;
`

const colStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid #fff;
  border-radius: 4px;
`

export default async function Features() {
  const extractInput = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-extract-input.js', 'utf-8')
  const extractOutput = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-extract-output.js', 'utf-8')
  const extractOutputCss = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-extract-output.css', 'utf-8')

  const supportVanilla = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-support-vanilla.js', 'utf-8')
  const supportReact = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-support-react.jsx', 'utf-8')

  const ssrInput = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-ssr-input.jsx', 'utf-8')
  const ssrOutput = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-ssr-output.html', 'utf-8')
  const ssrOutputCss = await readFile(process.cwd() + '/src/features/TopPageTemplate/assets/sample-code-ssr-output.css', 'utf-8')

  return (
    <div>
      <section>
        <h3>Extract Atomic CSS at build time.</h3>
        <div className={rootStyle}>
          <div className={colStyle}>
            <CodeArea title="input.js" code={extractInput} lang="molcss" />
          </div>
          <div className={colStyle}>
            <CodeArea title="output.js" code={extractOutput} lang="js" />
            <div className={css`flex: 1;`} />
            <CodeArea title="output.css" code={extractOutputCss} lang="css" />
          </div>
        </div>
      </section>
      <section>
        <h3>Vanilla JS and React support.</h3>
        <div className={rootStyle}>
          <div className={colStyle}>
            <CodeArea title="use-in-vanilla.js" code={supportVanilla} lang="js" />
          </div>
          <div className={colStyle}>
            <CodeArea title="use-in-react.jsx" code={supportReact} lang="js" />
          </div>
        </div>
      </section>
      <section>
        <h3>Runtime style and SSR / SSG support.</h3>
        <div className={rootStyle}>
          <div className={colStyle}>
            <CodeArea title="input.jsx" code={ssrInput} lang="molcss" />
          </div>
          <div className={colStyle}>
            <CodeArea title="Result (formatted)" code={ssrOutput} lang="html" />
            <div className={css`flex: 1;`} />
            <CodeArea title="output.css" code={ssrOutputCss} lang="css" />
          </div>
        </div>
      </section>
    </div>
  )
}
