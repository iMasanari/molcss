import { css, mergeStyle } from 'molcss'
import { ComponentProps } from 'react'
import CodeArea from '../CodeArea/CodeArea'
import ExtractInput from './samples/extract-input.mdx'
import ExtractOutputCss from './samples/extract-output-css.mdx'
import ExtractOutputJs from './samples/extract-output-js.mdx'
import SsrInput from './samples/ssr-input.mdx'
import SsrOutputCss from './samples/ssr-output-css.mdx'
import SsrOutputHtml from './samples/ssr-output-html.mdx'
import SupportReact from './samples/support-react.mdx'
import SupportVanila from './samples/support-vanilla.mdx'

const rootStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 auto;

  @media screen and (min-width: 600px) {
    flex-direction: row;
  }
`

const colStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid #fff;
  border-radius: 4px;
`

const preStyle = css`
  overflow-x: auto;
  flex: 1;
  padding: 0 16px 16px;
  margin: 0;
`

const pre = ({ style: _, ...props }: ComponentProps<'pre'>) =>
  <pre {...props} className={mergeStyle(preStyle, props.className)} />

export default async function Features() {
  return (
    <div>
      <section>
        <h3>Extract Atomic CSS at build time.</h3>
        <div className={rootStyle}>
          <div className={colStyle}>
            <CodeArea title="input.js">
              <ExtractInput components={{ pre }} />
            </CodeArea>
          </div>
          <div className={colStyle}>
            <CodeArea title="output.js" className={css`flex: 1;`}>
              <ExtractOutputJs components={{ pre }} />
            </CodeArea>
            <CodeArea title="output.css">
              <ExtractOutputCss components={{ pre }} />
            </CodeArea>
          </div>
        </div>
      </section>
      <section>
        <h3>Vanilla JS and React support.</h3>
        <div className={rootStyle}>
          <div className={colStyle}>
            <CodeArea title="use-in-vanilla.js">
              <SupportVanila components={{ pre }} />
            </CodeArea>
          </div>
          <div className={colStyle}>
            <CodeArea title="use-in-react.js">
              <SupportReact components={{ pre }} />
            </CodeArea>
          </div>
        </div>
      </section>
      <section>
        <h3>Runtime style and SSR / SSG support.</h3>
        <div className={rootStyle}>
          <div className={colStyle}>
            <CodeArea title="input.js">
              <SsrInput components={{ pre }} />
            </CodeArea>
          </div>
          <div className={colStyle}>
            <CodeArea title="Result (formatted)" className={css`flex: 1;`}>
              <SsrOutputHtml components={{ pre }} />
            </CodeArea>
            <CodeArea title="output.css">
              <SsrOutputCss components={{ pre }} />
            </CodeArea>
          </div>
        </div>
      </section>
    </div>
  )
}
