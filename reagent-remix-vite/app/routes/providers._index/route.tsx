import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from '@remix-run/react';
import T from '~/i18n/T';

import AnthropicSVG from './provider-logos/anthropic.svg';
import OpenAISVG from './provider-logos/openai-white-lockup.svg';
import ReplicateSVG from './provider-logos/replicate.svg';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import { CardActionAreaLink } from '~/components/CardActionAreaLink.js';
export const meta: MetaFunction = () => {
  return [
    { title: `Providers :: reagent` },
    {
      name: 'description',
      content: `All providers on reagent`,
    },
  ];
};

export default function Providers() {
  const navigate = useNavigate();

  return (
    <div>
      {/* a little overkill but matches the headers with buttons */}
      <Stack direction="row" spacing={2} alignItems="center" mb={4} mt={4}>
        <Typography variant="h1">
          <T>Providers</T>
        </Typography>
      </Stack>

      <Box mb={6}>
        <p>
          <T>
            reagent does not directly host AI models on its servers. When you
            use a noggin, the request is forwarded to an AI model hosted by one
            of these providers.
          </T>
        </p>

        <p>
          <T>
            Some AI models (e.g. open-source models like Llama and Whisper) may
            be available through multiple providers. Even for the same model,
            different providers may offer different speed, performance,
            features, or cost.
          </T>
        </p>

        <p>
          <T>
            Although reagent is free to use, AI models cost money to run. To
            create a noggin and use a model through reagent, you must:
          </T>
        </p>

        <ul>
          <li>
            <T flagged>
              Create an account with the provider and then configure your
              provider credentials on this page, OR
            </T>
          </li>
          <li>
            <T>
              Create <strong>organization-owned</strong> noggins, which are
              billed to the organization you have joined.
            </T>
          </li>
        </ul>
      </Box>

      <div className="provider-list">
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            {/* TODO: we should maybe populate this from the database and keep provider-specific code to noggin-server */}
            <Card>
              <CardActionAreaLink to="/providers/openai">
                <CardMedia
                  sx={{
                    height: 200,
                    backgroundColor: 'black',
                    backgroundSize: 'contain',
                    padding: '1rem',
                    backgroundOrigin: 'content-box',
                  }}
                  image={OpenAISVG}
                  title="OpenAI logo"
                />
                <CardContent>
                  <h2>
                    <T>OpenAI</T>
                  </h2>

                  <p>
                    <T>
                      OpenAI is a leader in generative AI models, offering
                      high-end models like GPT-4, DALL-E, and Whisper. Not all
                      models are open-source. Costs are generally low.
                    </T>
                  </p>
                </CardContent>
              </CardActionAreaLink>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardActionAreaLink to="/providers/replicate">
                <CardMedia
                  sx={{
                    height: 200,
                    backgroundColor: 'white',
                    backgroundSize: 'contain',
                    padding: '1rem',
                    backgroundOrigin: 'content-box',
                  }}
                  image={ReplicateSVG}
                  title="Replicate logo"
                />
                <CardContent>
                  <h2>
                    <T>Replicate</T>
                  </h2>

                  <p>
                    <T>
                      Replicate offers individually-billed requests to a wide
                      variety of open-source models, like Llama and Stable
                      Diffusion.
                    </T>
                  </p>
                </CardContent>
              </CardActionAreaLink>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardActionAreaLink to="/providers/anthropic">
                <CardMedia
                  sx={{
                    height: 200,
                    backgroundColor: 'white',
                    backgroundSize: 'contain',
                    padding: '1rem',
                    backgroundOrigin: 'content-box',
                  }}
                  image={AnthropicSVG}
                  title="Anthropic logo"
                />
                <CardContent>
                  <h2>
                    <T>Anthropic</T>
                  </h2>

                  <p>
                    <T>
                      Anthropic is known for Claude, a general-purpose large
                      language model with multimodal and reasoning capabilities
                      at various price points.
                    </T>
                  </p>
                </CardContent>
              </CardActionAreaLink>
            </Card>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
