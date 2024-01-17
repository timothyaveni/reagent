import {
  Alert,
  Box,
  ButtonBase,
  Skeleton,
  Stack,
  Link as StyledLink,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import tomorrow from 'react-syntax-highlighter/dist/cjs/styles/hljs/tomorrow';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useState } from 'react';
import MUILink from '~/components/MUILink';
import T from '~/i18n/T';
import {
  EditorVariablesList,
  useHasPopulatedStore,
} from '../noggins.$identifier.edit/noggin-editor/editor-utils';

js;

type CodeSamplesProps = {
  noggin: any; // TODO
  apiKey: string;
  nogginServerUrl: string;
  variables: EditorVariablesList;
  variableValues: Record<string, any>; // todo ig this is string or image
};

function UrlSample({
  noggin,
  apiKey,
  nogginServerUrl,
  variables,
  variableValues,
}: CodeSamplesProps) {
  const url = `${nogginServerUrl}/${noggin.slug}?key=${apiKey}${
    variables.length === 0
      ? ''
      : `&${variables
          .map(({ id, variable }) => {
            // TODO images
            return `${variable.name}=${encodeURIComponent(variableValues[id])}`;
          })
          .join('&')}`
  }`;
  return (
    <Box
      sx={{
        position: 'relative',
        '.MuiButtonBase-root': {
          opacity: 0,
          transition: 'opacity 0.1s',
        },
        '&:hover .MuiButtonBase-root': {
          opacity: 1,
        },
        mt: 2,
        padding: 2,
        border: '1px solid #ddd',
        borderRadius: '3px',
        backgroundColor: 'rgba(240, 240, 240, 0.8)',
      }}
    >
      <ButtonBase
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          padding: 1,
          borderRadius: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid #ddd',
        }}
        onClick={() => {
          navigator.clipboard.writeText(url);
        }}
      >
        <ContentCopyIcon color="primary" />
      </ButtonBase>

      <Stack
        sx={{
          wordBreak: 'break-all',
        }}
      >
        <code>
          {nogginServerUrl}/{noggin.slug}
        </code>
        <Box sx={{ pl: 2 }}>
          <code>?key={apiKey}</code>
        </Box>
        {variables.map(({ id, variable: parameter }) => {
          return (
            <Box sx={{ pl: 2 }}>
              <code>
                <Tooltip
                  title={
                    <>
                      <Typography variant="body1" component="p">
                        <T flagged>
                          Variables are{' '}
                          <StyledLink
                            color="#ffffff"
                            href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent"
                            target="_blank"
                          >
                            URL-encoded
                          </StyledLink>{' '}
                          when used in a URL.
                        </T>
                      </Typography>
                      {parameter.type === 'image' ? (
                        <Typography variant="body1" component="p">
                          <T flagged>
                            When accessing the noggin with a URL, image
                            variables must be uploaded to a publicly-accessible
                            URL.
                          </T>
                        </Typography>
                      ) : null}
                    </>
                  }
                >
                  <span>
                    &{parameter.name}=
                    <strong>{encodeURIComponent(variableValues[id])}</strong>
                  </span>
                </Tooltip>
              </code>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function CodeSample(
  props: CodeSamplesProps & { language: string; children: React.ReactNode },
) {
  return (
    <Box
      sx={{
        position: 'relative',
        '.MuiButtonBase-root': {
          opacity: 0,
          transition: 'opacity 0.1s',
        },
        '&:hover .MuiButtonBase-root': {
          opacity: 1,
        },
      }}
    >
      <ButtonBase
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: 1,
          borderRadius: '3px',
          backgroundColor: 'rgba(240, 240, 240, 0.8)',
          border: '1px solid #ddd',
        }}
        onClick={() => {
          navigator.clipboard.writeText(props.children?.toString() || '');
        }}
      >
        <ContentCopyIcon color="primary" />
      </ButtonBase>
      <SyntaxHighlighter language={props.language} style={tomorrow}>
        {props.children}
      </SyntaxHighlighter>
    </Box>
  );
}

function JavascriptSample(props: CodeSamplesProps) {
  return (
    <CodeSample language="javascript" {...props}>
      {`// import fetch from 'node-fetch'; // for node.js

const response = await fetch(
  '${props.nogginServerUrl}/${props.noggin.slug}',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ${props.apiKey}',
    },
    body: JSON.stringify({
      ${props.variables
        .map(({ id, variable }) => {
          return `${variable.name}: ${JSON.stringify(
            props.variableValues[id],
          )},`;
        })
        .join('\n      ')}
    }),
  }
).then(response => response.text());`}
    </CodeSample>
  );
}

function PythonSample(props: CodeSamplesProps) {
  return (
    <CodeSample language="python" {...props}>
      {`import requests

response = requests.post(
  '${props.nogginServerUrl}/${props.noggin.slug}',
  headers={
    'Authorization': 'Bearer ${props.apiKey}',
    'Content-Type': 'application/json',
  },
  json={
    ${props.variables
      .map(({ id, variable }) => {
        return `'${variable.name}': ${JSON.stringify(
          props.variableValues[id],
        )},`;
      })
      .join('\n    ')}
  }
).text`}
    </CodeSample>
  );
}

// TODO: this is copilot, i haven't tested it
function KotlinSample(props: CodeSamplesProps) {
  return (
    <CodeSample language="kotlin" {...props}>
      {`val response = khttp.post(
  url = '${props.nogginServerUrl}/${props.noggin.slug}',
  headers = mapOf(
    "Authorization" to "Bearer ${props.apiKey}",
    "Content-Type" to "application/json",
  ),
  json = mapOf(
    ${props.variables
      .map(({ id, variable }) => {
        return `"${variable.name}" to ${JSON.stringify(
          props.variableValues[id],
        )},`;
      })
      .join('\n    ')}
  )
).text`}
    </CodeSample>
  );
}

export default function CodeSamples(props: CodeSamplesProps) {
  const hasPopulatedStore = useHasPopulatedStore();
  const [tab, setTab] = useState('url');

  if (!hasPopulatedStore) {
    return <Skeleton variant="rounded" height={50} />;
  }

  return (
    <>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable">
        <Tab label="URL" value="url" />
        <Tab label="Javascript" value="js" />
        <Tab label="Python" value="python" />
        <Tab label="Kotlin" value="kotlin" />
      </Tabs>
      {tab === 'url' ? (
        <UrlSample {...props} />
      ) : tab === 'js' ? (
        <JavascriptSample {...props} />
      ) : tab === 'python' ? (
        <PythonSample {...props} />
      ) : tab === 'kotlin' ? (
        <KotlinSample {...props} />
      ) : null}

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <T>
            {/* todo revisit this when we understand billing better */}
            These code samples include a key (starting with <code>rg_</code>)
            specific to this noggin. Anyone with this key can use your noggin,
            which will charge to the noggin's credit balance. You should{' '}
            <strong>keep the key secret</strong> where possible, especially if
            your noggin has a high credit budget or allows many model inputs to
            be overridden. <MUILink to="#">Learn more</MUILink>
            {/* todo learn more */}
          </T>
        </Typography>
      </Alert>
    </>
  );
}
