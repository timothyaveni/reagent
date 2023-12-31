import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { requireUser } from '~/auth/auth.server';
import { loadNogginsIndex } from '~/models/noggin.server';

import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import './NogginList.css';

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const noggins = await loadNogginsIndex(context);

  return json({ noggins });
};

// TODO type
function NogginCard({ noggin }: { noggin: any }) {
  return (
    <div className="noggin-card">
      <Link to={`/noggins/${noggin.slug}/edit`} key={noggin.slug}>
        {noggin.title}
      </Link>
    </div>
  );
}

export default function NogginList() {
  const { noggins } = useLoaderData<typeof loader>();

  return (
    <div className="noggin-list">
      <h1>Noggins</h1>
      <Link to="/noggins/new">New noggin</Link>

      {noggins.map((noggin) => (
        <NogginCard key={noggin.slug} noggin={noggin} />
      ))}
    </div>
  );
}
