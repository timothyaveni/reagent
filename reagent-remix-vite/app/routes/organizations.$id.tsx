import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { requireUser } from '~/auth/auth.server';
import T from '~/i18n/T';
import { loadOrganization } from '~/models/organization';
import { notFound } from '~/route-utils/status-code';

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  const user = requireUser(context);

  const { id } = params;

  if (!id) {
    throw notFound();
  }

  const organization = await loadOrganization({
    id: parseInt(id, 10),
  });

  console.log(organization)

  if (!organization) {
    throw notFound();
  }

  return json({ organization });
};

export default function OrganizationsList() {
  const { organization } = useLoaderData<typeof loader>();

  return (
    <div>
      <Link to="/organizations"><T>All my organizations</T></Link>
      <h1>{organization.name}</h1>
    </div>
  );
}
