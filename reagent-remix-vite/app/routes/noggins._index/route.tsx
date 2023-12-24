import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { AppLoadContext } from '@remix-run/server-runtime';
import { requireUser } from '~/auth/auth.server';
import { loadNogginsIndex } from '~/models/noggin.server';

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
      <Link to={`/noggins/${noggin.slug}`} key={noggin.slug}>
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

      {
        // @ts-expect-error ugh idk why the types are wonky from loader data
        noggins.map((noggin) => (
          <NogginCard key={noggin.slug} noggin={noggin} />
        ))
      }
    </div>
  );
}
