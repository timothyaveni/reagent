import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import Editor from '../../noggin-editor/text-completion/Editor.client';
import { useEffect, useState } from "react";
import { requireUser } from "~/auth/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  return null;
}

const RemixEditorWrapper = () => {
  // dude this is SO INCREDIBLY not a vibe
  // but i'm having a couple bundler problems with the editor on the server
  // and dude. i really do not need to render this on the server.
  // paranoid it's going to join the websocket room during ssr anyway lol
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // TODO: loading screen
  }

  return <Editor />;
};

export default function Index() {
  return (
    <RemixEditorWrapper />
  );
}
