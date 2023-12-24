import { useEffect } from 'react';
import { initializeStoreForNoggin } from '~/routes/noggins.$identifier.edit/text-completion/store';
import { useRevalidator } from '@remix-run/react';

interface EditorWebsocketPopulatorProps {
  noggin: {
    id: number; // TODO
  };
  authToken: string;
  setStoreAndWebsocketProvider: (args: {
    store: any;
    websocketProvider: any;
  }) => void;
}

export function EditorWebsocketPopulator({
  noggin,
  authToken,
  setStoreAndWebsocketProvider,
}: EditorWebsocketPopulatorProps) {
  const revalidator = useRevalidator();

  // this is hacky af. by bringing this into a separate component with a .client extension, we can make sure it doesn't get brought in in SSR.
  // on client render we actually set the parent component's store and websocketProvider
  useEffect(() => {
    // todo: kill old websocket on param change. but not when we just go to a subpage
    const { store, websocketProvider } = initializeStoreForNoggin(
      {
        id: noggin.id,
      },
      authToken,
      revalidator.revalidate,
    );

    console.log('store useeffect');
    setStoreAndWebsocketProvider({ store, websocketProvider });
  }, [noggin.id, authToken]);

  return null;
}
