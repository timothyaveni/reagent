import type { AppLoadContext as OriginalAppLoadContext } from '@remix-run/server-runtime';

declare module '@remix-run/server-runtime' {
  export interface AppLoadContext extends OriginalAppLoadContext {
    user?: {
      id: number;
    };
    session: {
      lastLTILaunch?: {
        launchParams: any;
        connectionId: number;
      };
    };
    loginNewUser: (user: { id: number }) => Promise<void>;
  }
}

// declare module '@remix-run/server-runtime' {
//   export interface AppLoadContext {

//   }
// }
