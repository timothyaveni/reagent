import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { useEffect, useState } from 'react';
import { requireUser } from '~/auth/auth.server';
import {
  getNogginEditorSchema_OMNISCIENT,
  loadNogginBySlug,
} from '~/models/noggin.server';
import { notFound } from '~/route-utils/status-code';
import Editor from './noggin-editor/Editor';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const user = requireUser(context);
  const { identifier } = params;

  const noggin = await loadNogginBySlug(context, { slug: identifier || '' });

  if (!noggin) {
    throw notFound();
  }

  const editorSchema = await getNogginEditorSchema_OMNISCIENT(noggin.id);

  return json({ noggin, editorSchema });
};

export default function NogginEditor() {
  const [isMounted, setIsMounted] = useState(false);
  const { noggin, editorSchema } = useLoaderData<typeof loader>();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // TODO
  }

  return <Editor noggin={noggin} editorSchema={editorSchema} />;
}
