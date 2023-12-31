import { Alert } from '@mui/material';
import Markdown from 'react-markdown';

export function MarkdownWithAdmonitions({
  children,
}: {
  children: string;
}): JSX.Element {
  return (
    <Markdown
      components={{
        // todo: this is a hack mostly assuming we'll never use an actual code block in these markdowns
        pre: ({ children }) => <>{children}</>,
        code: (props) => {
          if (props.className === 'language-info') {
            return <Alert severity="info">{props.children}</Alert>;
          } else if (props.className === 'language-success') {
            return <Alert severity="success">{props.children}</Alert>;
          } else if (props.className === 'language-warn') {
            return <Alert severity="warning">{props.children}</Alert>;
          } else if (props.className === 'language-error') {
            return <Alert severity="error">{props.children}</Alert>;
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
