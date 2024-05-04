import { json } from '@remix-run/node';
import { useEffect, useState } from 'react';
import {
  loadNogginBySlug,
  updateNogginBudget,
  updateNogginTitle,
} from '~/models/noggin.server';

import { Outlet, useLoaderData, useRevalidator } from '@remix-run/react';
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  ServerRuntimeMetaFunction as MetaFunction,
} from '@remix-run/server-runtime';
import { WebsocketProvider } from 'y-websocket';
import {
  getNogginTotalAllocatedCreditQuastra,
  getNogginTotalIncurredCostQuastra,
} from '~/models/nogginRuns.server';
import { getPermittedAdditionalBudgetForOrganizationAndOwner } from '~/models/organization.server';
import { notFound } from '~/route-utils/status-code';
import {
  NogginEditorStore,
  initializeStoreForNoggin,
} from '~/routes/noggins.$identifier.edit/noggin-editor/store.client';
import { useRootHasPopulatedStore } from '../noggins.$identifier.edit/noggin-editor/editor-utils';
import EditorHeader from './EditorHeader';
import { StoreContext } from './StoreContext';
import { genAuthTokenForNoggin } from './jwt.server';

export const handle = {
  wideLayout: true,
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.noggin.title} :: reagent` },
    {
      name: 'description',
      content: `${data?.noggin.title} on reagent`,
    },
  ];
};

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const { identifier } = params;

  const noggin = await loadNogginBySlug(context, { slug: identifier });

  if (!noggin) {
    throw notFound();
  }

  const authToken = genAuthTokenForNoggin(noggin.id);

  const totalIncurredCostQuastra = await getNogginTotalIncurredCostQuastra(
    context,
    {
      nogginId: noggin.id,
    },
  );

  const totalAllocatedCreditQuastra =
    await getNogginTotalAllocatedCreditQuastra(context, {
      nogginId: noggin.id,
    });

  const permittedBudgetQuastraIncludingThisNoggin =
    noggin.parentOrgId === null
      ? null
      : await getPermittedAdditionalBudgetForOrganizationAndOwner(context, {
          organizationId: noggin.parentOrgId,
          teamOwnerId: noggin.teamOwnerId,
        });

  const permittedBudgetQuastra =
    permittedBudgetQuastraIncludingThisNoggin === null
      ? null
      : permittedBudgetQuastraIncludingThisNoggin +
        (totalAllocatedCreditQuastra || 0); // this || 0 is a lil awkward bc null actually means unlimited

  return json({
    Y_WEBSOCKET_SERVER_EXTERNAL_URL:
      process.env.Y_WEBSOCKET_SERVER_EXTERNAL_URL || '',
    noggin,
    authToken,
    totalIncurredCostQuastra,
    totalAllocatedCreditQuastra,
    permittedBudgetQuastra,
  });
};

export const action = async ({
  context,
  params,
  request,
}: ActionFunctionArgs) => {
  const { identifier } = params;

  const noggin = await loadNogginBySlug(context, { slug: identifier });

  if (!noggin) {
    throw notFound();
  }

  const body = await request.formData();
  const action = body.get('action')?.toString() || null;

  if (action === 'saveTitle') {
    const newTitle = body.get('newTitle')?.toString() || null;

    if (newTitle !== null) {
      await updateNogginTitle(context, {
        nogginSlug: identifier || '',
        title: newTitle,
      });

      return json({ ok: true });
    }
  } else if (action === 'setBudget') {
    const budgetQuastra = body.get('budgetQuastra')?.toString() || null;

    let savedBudgetQuastra;
    if (budgetQuastra === null || budgetQuastra === 'null') {
      savedBudgetQuastra = null;
    } else {
      savedBudgetQuastra = parseFloat(budgetQuastra);
      if (isNaN(savedBudgetQuastra)) {
        return json({ ok: false, error: 'Invalid budget' }, { status: 400 });
      }

      const minBudget = await getNogginTotalIncurredCostQuastra(context, {
        nogginId: noggin.id,
      });

      if (savedBudgetQuastra < minBudget) {
        savedBudgetQuastra = minBudget;
      }
    }

    if (savedBudgetQuastra !== null) {
      savedBudgetQuastra = BigInt(Math.round(savedBudgetQuastra));
    }

    await updateNogginBudget(context, {
      nogginId: noggin.id,
      budgetQuastra: savedBudgetQuastra,
    });

    return json({ ok: true });
  }
};

export type NogginRouteLoaderType = typeof loader;

const WebsocketConnectedSubpage = () => {
  const { Y_WEBSOCKET_SERVER_EXTERNAL_URL, noggin, authToken } =
    useLoaderData<typeof loader>();
  const [storeAndWebsocketProvider, setStoreAndWebsocketProvider] = useState<{
    store: NogginEditorStore | null;
    websocketProvider: WebsocketProvider | null;
  }>({
    store: null,
    websocketProvider: null,
  });

  const revalidator = useRevalidator();

  useEffect(() => {
    console.log('useEffect', { nogginid: noggin.id, authToken });

    // initializeStoreForNoggin is in a .client file, so it will be undefined on SSR, but the useEffect doesn't run anyway
    // todo: kill old websocket on param change. but not when we just go to a subpage
    const { store, websocketProvider } = initializeStoreForNoggin(
      Y_WEBSOCKET_SERVER_EXTERNAL_URL,
      {
        id: noggin.id,
      },
      authToken,
      revalidator.revalidate,
    );

    console.log('store useeffect');
    setStoreAndWebsocketProvider({ store, websocketProvider });
  }, [noggin.id, authToken]);

  const hasPopulatedStore = useRootHasPopulatedStore(
    storeAndWebsocketProvider.store,
  );

  console.log({ store: storeAndWebsocketProvider.store, hasPopulatedStore });

  return (
    <StoreContext.Provider
      value={{
        ...storeAndWebsocketProvider,
        hasPopulatedStore,
      }}
    >
      <Outlet />
    </StoreContext.Provider>
  );
};

export default function EditorPage() {
  return (
    <>
      <EditorHeader />
      <WebsocketConnectedSubpage />
    </>
  );
}
