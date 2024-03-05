import { json } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import {
  disableAIModelForOrganization,
  enableAIModelForOrganization,
  getEnabledAIModelIDsForOrganization,
  loadOrganization,
  requireAtLeastUserOrganizationRole,
} from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import { OrganizationRole } from '~/shared/organization';

import {
  Box,
  Switch,
  Table,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@remix-run/server-runtime';

import { ServerRuntimeMetaFunction as MetaFunction } from '@remix-run/server-runtime';
import T from '~/i18n/T';
import { indexAIModels } from '~/models/aiModel.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `Models enabled for ${data?.organization?.name} :: Organizations :: reagent`,
    },
    {
      name: 'description',
      content: `Configure enabled AI models for the ${data?.organization?.name} organization on reagent`,
    },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const idNumber = parseInt(id, 10);

  const organization = await loadOrganization(context, {
    id: idNumber,
  });

  await requireAtLeastUserOrganizationRole(context, {
    organizationId: idNumber,
    role: OrganizationRole.OWNER,
  });

  const enabledAIModelIds = await getEnabledAIModelIDsForOrganization(context, {
    organizationId: idNumber,
  });

  const allModels = await indexAIModels(context);

  return json({
    organization,
    enabledAIModelIds,
    allModels,
  });
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const idNumber = parseInt(id, 10);

  const modelId = formData.get('modelId')?.toString();
  const action = formData.get('action')?.toString();

  if (!modelId || !action) {
    throw new Error('Invalid request');
  }

  if (action === 'enable') {
    await enableAIModelForOrganization(context, {
      organizationId: idNumber,
      modelId: parseInt(modelId, 10),
    });
    return json({ success: true });
  } else if (action === 'disable') {
    await disableAIModelForOrganization(context, {
      organizationId: idNumber,
      modelId: parseInt(modelId, 10),
    });
    return json({ success: true });
  } else {
    throw new Error('Invalid action');
  }
};

export const handle = {
  breadcrumb: () => {
    return <Typography>Enabled models</Typography>;
  },
};

export default function OrganizationEnabledModels() {
  const { allModels, enabledAIModelIds } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  return (
    <Box mt={4}>
      <Table>
        {allModels.map((model) => {
          return (
            <TableRow key={model.id}>
              <TableCell>
                <Typography variant="h5">
                  <T flagged>
                    {model.modelProvider.name}/<strong>{model.name}</strong>
                  </T>
                </Typography>
              </TableCell>
              <TableCell>
                <Switch
                  checked={enabledAIModelIds.includes(model.id)}
                  name={`enabled-${model.id}`}
                  onChange={(event) => {
                    const action = event.target.checked ? 'enable' : 'disable';

                    // TODO of course it's better to do this eagerly but i'm in a rush and you're lucky you're getting a ui other than psql in the first place
                    submit(
                      {
                        action,
                        modelId: model.id,
                      },
                      {
                        method: 'POST',
                        navigate: false,
                      },
                    );
                  }}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </Table>
    </Box>
  );
}
