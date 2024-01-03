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
  EditorParametersList,
  useHasPopulatedStore,
} from '../noggins.$identifier.edit/noggin-editor/editor-utils';

js;

type CodeSamplesProps = {
  noggin: any; // TODO
  apiKey: string;
  nogginServerUrl: string;
  parameters: EditorParametersList;
  parameterValues: Record<string, any>; // todo ig this is string or image
};

function UrlSample({
  noggin,
  apiKey,
  nogginServerUrl,
  parameters,
  parameterValues,
}: CodeSamplesProps) {
  const url = `${nogginServerUrl}/${noggin.slug}?key=${apiKey}${
    parameters.length === 0
      ? ''
      : `&${parameters
          .map(({ id, parameter }) => {
            // TODO images
            return `${parameter.name}=${encodeURIComponent(
              parameterValues[id],
            )}`;
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
        {parameters.map(({ id, parameter }) => {
          return (
            <Box sx={{ pl: 2 }}>
              <code>
                &{parameter.name}=
                <Tooltip
                  title={
                    <Typography variant="body1">
                      Variables are{' '}
                      <StyledLink
                        color="#ffffff"
                        href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent"
                        target="_blank"
                      >
                        URL-encoded
                      </StyledLink>{' '}
                      when used in a URL.
                    </Typography>
                  }
                >
                  <strong>{encodeURIComponent(parameterValues[id])}</strong>
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
      ${props.parameters
        .map(({ id, parameter }) => {
          return `${parameter.name}: ${JSON.stringify(
            props.parameterValues[id],
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
    ${props.parameters
      .map(({ id, parameter }) => {
        return `'${parameter.name}': ${JSON.stringify(
          props.parameterValues[id],
        )},`;
      })
      .join('\n    ')}
  }
).text`}
    </CodeSample>
  );
}

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
    ${props.parameters
      .map(({ id, parameter }) => {
        return `"${parameter.name}" to ${JSON.stringify(
          props.parameterValues[id],
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
