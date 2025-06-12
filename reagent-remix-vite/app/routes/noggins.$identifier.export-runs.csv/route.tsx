import { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { exportNogginRuns } from '~/models/nogginRuns.server';
// import { exportAttendanceSpreadsheetForSite } from "~/models/session.server";
import { notFound } from '~/route-utils/status-code.js';

export const loader = async ({
  request,
  context,
  params,
}: LoaderFunctionArgs) => {
  const { identifier } = params;
  if (!identifier) {
    throw notFound();
  }

  const now = new Date().toISOString().replace(/[:.]/g, '-');

  const csv = await exportNogginRuns(context, {
    slug: identifier,
  });

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${identifier}-runs-${now}.csv"`,
    },
  });
};
