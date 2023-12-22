import { LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { AppLoadContext } from '@remix-run/server-runtime';
import { requireUser, requireUserPreservingPath } from '~/auth/auth.server';
import { createNoggin, loadNogginsIndex } from '~/models/noggin.server';

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const noggins = await loadNogginsIndex(context);

  return json({ noggins });
};

export const action = async ({
  request,
  context,
}: {
  request: any;
  context: AppLoadContext;
}) => {
  const user = requireUserPreservingPath(request, context);

  const noggin = await createNoggin(context, {
    ownerType: 'user',
    ownerId: user.id,
  });

  // TODO: either fix the global state pollution or make this a hard redirect
  return redirect(`/noggins/${noggin.slug}`);
};

export default function NogginList() {
  const { noggins } = useLoaderData<typeof loader>();

  return (
    <div className="noggin-list">
      <h1>Noggins</h1>
      <Form method="post" action="/noggins">
        <button type="submit">New noggin</button>
      </Form>

      <ul>
        {
          // @ts-expect-error ugh idk why the types are wonky from loader data
          noggins.map((noggin) => {
            return (
              <li key={noggin.slug}>
                <Link to={`/noggins/${noggin.slug}`} key={noggin.slug}>
                  {noggin.title}
                </Link>
              </li>
            );
          })
        }
      </ul>
    </div>
  );
}
