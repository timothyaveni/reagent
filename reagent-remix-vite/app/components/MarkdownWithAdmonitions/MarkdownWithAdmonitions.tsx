import { Alert } from '@mui/material';
import Markdown from 'react-markdown';

import './MarkdownWithAdmonitions.css';

export function MarkdownWithAdmonitions({
  children,
}: {
  children: string;
}): JSX.Element {
  return (
    <Markdown
      className="markdown-with-admonitions"
      components={{
        // todo: this is a hack mostly assuming we'll never use an actual code block in these markdowns
        pre: ({ children }) => <>{children}</>,
        code: (props) => {
          if (props.className === 'language-info') {
            return (
              <Alert severity="info">
                <Markdown className="inner-markdown">
                  {props.children as any}
                </Markdown>
              </Alert>
            );
          } else if (props.className === 'language-success') {
            return (
              <Alert severity="success">
                <Markdown className="inner-markdown">
                  {props.children as any}
                </Markdown>
              </Alert>
            );
          } else if (props.className === 'language-warn') {
            return (
              <Alert severity="warning">
                <Markdown className="inner-markdown">
                  {props.children as any}
                </Markdown>
              </Alert>
            );
          } else if (props.className === 'language-error') {
            return (
              <Alert severity="error">
                <Markdown className="inner-markdown">
                  {props.children as any}
                </Markdown>
              </Alert>
            );
          } else {
            // maybe todo
            return <code>{props.children}</code>;
          }
        },
      }}
    >
      {children}
    </Markdown>
  );
}
