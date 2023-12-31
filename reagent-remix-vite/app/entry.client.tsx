import { CacheProvider } from '@emotion/react';
import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode, useCallback, useState } from 'react';
import { hydrateRoot } from 'react-dom/client';

import ClientStyleContext from '~/styles/client.context';
import createEmotionCache from '~/styles/createEmotionCache';

interface ClientCacheProviderProps {
  children: React.ReactNode;
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
  const [cache, setCache] = useState(createEmotionCache());

  const reset = useCallback(() => {
    setCache(createEmotionCache());
  }, []);

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  );
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <ClientCacheProvider>
        <RemixBrowser />
      </ClientCacheProvider>
    </StrictMode>,
  );
});
