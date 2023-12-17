import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { indexOrganizations } from '~/models/organization.server';
import T from '~/i18n/T';
import { AppLoadContext } from '@remix-run/server-runtime';

export const loader = async ({ context }: {
  context: AppLoadContext;
}) => {
  const organizations = await indexOrganizations(context);

  return json({ organizations });
};

export default function OrganizationsList() {
  const { organizations } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Organizations</h1>

      <div>
        {
          organizations.length > 0 ? <T>These are the organizations you're a member of.</T> : <T>You're not a member of any organizations.</T>
        }
      </div>

      <div>
        <Link to="/organizations/new">New organization</Link>
      </div>

      <ul>
        {organizations.map((organization) => {
          return (
            <li key={organization.id}>
              <Link to={`/organizations/${organization.id}`}>
                {organization.name}
              </Link>
              {/* <a href={`/organizations/${organization.id}`}>{organization.name}</a> */}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
