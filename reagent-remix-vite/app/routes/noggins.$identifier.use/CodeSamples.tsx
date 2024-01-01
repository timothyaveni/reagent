import { Skeleton, Stack, Typography } from '@mui/material';
import {
  EditorParametersList,
  useHasPopulatedStore,
} from '../noggins.$identifier.edit/noggin-editor/editor-utils';

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
  const url = `${nogginServerUrl}/${noggin.slug}
   ?key=${apiKey}
   &`;
  return (
    <Stack>
      <Typography variant="body1">
        {nogginServerUrl}/{noggin.slug}
      </Typography>
      <Typography variant="body1" sx={{ pl: 2 }}>
        ?key={apiKey}
      </Typography>
      {parameters.map(({ id, parameter }) => {
        if (parameter.type === 'image') {
          return (
            <div key={id}>
              <strong>{parameter.name}</strong> is an image parameter, not yet
              implemented in the reagent UI
            </div>
          ); // TODO
        }

        return (
          <Typography variant="body1" sx={{ pl: 2 }}>
            &{parameter.name}=
            <strong>{encodeURIComponent(parameterValues[id])}</strong>
          </Typography>
        );
      })}
    </Stack>
  );
}

export default function CodeSamples(props: CodeSamplesProps) {
  const hasPopulatedStore = useHasPopulatedStore();

  if (!hasPopulatedStore) {
    return <Skeleton variant="rounded" height={50} />;
  }

  return <UrlSample {...props} />;
}
