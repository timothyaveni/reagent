import { Box, Paper, Stack, Typography } from '@mui/material';
import { ReactNode, createContext, useContext } from 'react';
import type {
  IOVisualizationChatTextTurn,
  IOVisualizationComponent_ChatText,
  IOVisualizationElement,
  IOVisualizationHyperTextElement,
  IOVisualizationHyperTextElement_Asset,
  IOVisualizationHyperTextElement_EvaluatedVariable,
  IOVisualizationRender,
  IOVisualizationTopLevelComponent,
} from 'reagent-noggin-shared/io-visualization-types/IOVisualizationRender';
import { I18nString } from 'reagent-noggin-shared/types/editorSchemaV1';
import T, { t } from '~/i18n/T';

const ResponseContext = createContext<ReactNode | null>(null);

// todo would be cute to show a 'typing' indicator if this is chat -- but might require us to keep outputState around
export function IOVisualizationResponse() {
  const outputTree = useContext(ResponseContext);

  if (!outputTree) {
    return null;
  }

  return outputTree;
}

export function IOVisualizationHyperTextAsset({
  asset,
}: {
  asset: IOVisualizationHyperTextElement_Asset;
}) {
  // todo don't render alt text if there isn't any -- undefined might work but need to make sure it doesn't render an empty alt
  return <img src={asset.url} alt={asset.altText} />;
}

export function IOVisualizationHypertextVariable({
  variable,
}: {
  variable: IOVisualizationHyperTextElement_EvaluatedVariable;
}) {
  if (variable.variableEvaluatedValue.type === 'text') {
    return (
      <span>
        <strong>{variable.variableEvaluatedValue.text}</strong>
      </span>
    );
  } else if (variable.variableEvaluatedValue.type === 'asset') {
    return (
      <img
        src={variable.variableEvaluatedValue.url}
        style={{
          maxWidth: 300,
        }}
      />
    );
  }

  const _exhaustiveCheck: never = variable.variableEvaluatedValue;
}

export function IOVisualizationHypertextElement({
  element,
}: {
  element: IOVisualizationHyperTextElement;
}) {
  if (element.type === 'text') {
    return <span>{element.text}</span>;
  } else if (element.type === 'variable') {
    return <IOVisualizationHypertextVariable variable={element} />;
  } else if (element.type === 'asset') {
    return null;
  }

  const _exhaustiveCheck: never = element;
}

export function IOVisualizationHypertext({
  hypertext,
}: {
  hypertext: IOVisualizationHyperTextElement[];
}) {
  return (
    <div>
      {hypertext.map((element, index) => {
        return (
          <IOVisualizationHypertextElement key={index} element={element} />
        );
      })}
    </div>
  );
}

export function IOVisualizationElement({
  element,
}: {
  element: IOVisualizationElement;
}) {
  if (element.type === 'hypertext') {
    return <IOVisualizationHypertext hypertext={element.children} />;
  } else if (element.type === 'asset') {
    return <div>asset</div>;
  } else if (element.type === 'response void') {
    return <IOVisualizationResponse />;
  }

  const _exhaustiveCheck: never = element;
}

const chatTurnIsResponseVoid = (turn: IOVisualizationChatTextTurn) => {
  return turn.content.length === 1 && turn.content[0].type === 'response void';
};

export function IOVisualizationChatTextTurn({
  turn,
}: {
  turn: IOVisualizationChatTextTurn;
}) {
  return (
    <Paper
      sx={{
        p: 2,
        my: 2,
        ...(turn.speaker === 'user'
          ? {
              ml: 16,
            }
          : {
              mr: 16,
            }),
        ...(chatTurnIsResponseVoid(turn)
          ? {
              backgroundColor: '#fffad9',
            }
          : {}),
      }}
    >
      <div>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          <T flagged>
            {turn.speaker.toLocaleUpperCase()}
            {chatTurnIsResponseVoid(turn) ? ' (response)' : ''}
          </T>
        </Typography>
      </div>
      <div>
        {turn.content.map((element, index) => {
          return <IOVisualizationElement key={index} element={element} />;
        })}
      </div>
    </Paper>
  );
}

export function IOVisualizationChatTextComponent({
  chatTextComponent,
}: {
  chatTextComponent: IOVisualizationComponent_ChatText;
}) {
  return (
    <Box
      sx={{
        width: '800px',
        margin: '0 auto',
      }}
    >
      {chatTextComponent.turns.map((turn, index) => {
        return <IOVisualizationChatTextTurn key={index} turn={turn} />;
      })}
    </Box>
  );
}

function IOVisualizationRawElement({
  content,
}: {
  content: IOVisualizationElement[];
}) {
  return (
    // maybe more config in the future for whether it's centered like this idk
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 1,
          width: 'fit-content',
          mt: 3,
        }}
      >
        {content.map((element, index) => {
          return <IOVisualizationElement key={index} element={element} />;
        })}
      </Paper>
    </Box>
  );
}

function IOVisualizationElementWithTitle({
  title,
  content,
}: {
  title: I18nString;
  content: IOVisualizationElement[];
}) {
  return (
    <Stack spacing={1} sx={{ width: 800, margin: '0 auto' }}>
      <Typography variant="h6">{t(title)}</Typography>
      <Paper
        sx={{
          p: 2,
          my: 2,
        }}
      >
        {content.map((element, index) => {
          return <IOVisualizationElement key={index} element={element} />;
        })}
      </Paper>
    </Stack>
  );
}

export function IOVisualizationComponent({
  component,
}: {
  component: IOVisualizationTopLevelComponent;
}) {
  if (component.type === 'chat text') {
    return <IOVisualizationChatTextComponent chatTextComponent={component} />;
  } else if (component.type === 'element with title') {
    return (
      <IOVisualizationElementWithTitle
        title={component.title}
        content={component.content}
      />
    );
  } else if (component.type === 'raw element') {
    return <IOVisualizationRawElement content={component.content} />;
  }

  const _exhaustiveCheck: never = component;
}

export function IOVisualizationColumn({
  components,
}: {
  components: IOVisualizationTopLevelComponent[];
}) {
  return components.map((component, index) => {
    return <IOVisualizationComponent key={index} component={component} />;
  });
}

export function IOVisualization({
  ioVisualizationRender,
  children,
}: {
  ioVisualizationRender: IOVisualizationRender | null;
  children: ReactNode | ReactNode[];
}) {
  if (!ioVisualizationRender) {
    // we probably won't have model output before the viz but in case it never gets defined let's render the output
    return children;
  }

  return (
    <ResponseContext.Provider value={children}>
      <IOVisualizationColumn
        components={ioVisualizationRender.payload.primaryView}
      />
      <IOVisualizationColumn
        components={ioVisualizationRender.payload.secondaryView}
      />
    </ResponseContext.Provider>
  );
}
