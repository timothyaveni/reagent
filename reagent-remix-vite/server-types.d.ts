declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    user?: {
      id: number;
    };
    session: {
      lastLTILaunch?: {
        launchParams: any;
        connectionId: number;
      };
      postLoginRedirect?: string | null;
    }
    loginNewUser: (user: { id: number }) => Promise<void>;
  }
}