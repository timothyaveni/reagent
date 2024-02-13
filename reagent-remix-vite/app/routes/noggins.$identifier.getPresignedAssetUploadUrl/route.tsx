import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import { ReagentBucket } from 'reagent-noggin-shared/object-storage-buckets';
import { loadNogginBySlug } from '~/models/noggin.server';
import { getBucket, minioClient } from '~/object-storage/minio';
import { notFound } from '~/route-utils/status-code';

import { v4 as uuid } from 'uuid';

export const action = async ({
  context,
  params,
  request,
}: ActionFunctionArgs) => {
  const { identifier } = params;
  const { extension } = await request.json();

  if (!['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    throw new Error('Invalid extension');
  }

  const noggin = await loadNogginBySlug(context, { slug: identifier });

  if (!noggin) {
    throw notFound();
  }

  const externalHost = (process.env.OBJECT_STORAGE_EXTERNAL_URL || '').replace(
    /https?:\/\//,
    '',
  );

  const filename = `${uuid()}.${extension}`;

  // method, bucketName, objectName, expires, reqParams, requestDate, signedHost, cb
  const url = await minioClient.presignedUrl(
    'PUT',
    await getBucket(ReagentBucket.NOGGIN_RUN_INPUTS),
    filename,
    60 * 60 * 24,
    {},
    new Date(),
    // @ts-expect-error
    externalHost,
  );

  console.log('url', url);

  // TODO: toss this in prisma as well, linked to a noggin but not to a run yet

  const objectStorageExternalUrlIsHttps =
    !!process.env.OBJECT_STORAGE_EXTERNAL_URL?.startsWith('https');

  return json({
    presignedUrl: objectStorageExternalUrlIsHttps
      ? url.toString().replace('http', 'https') // don't ask about the toString
      : url,
    uploadUrl: `${process.env.OBJECT_STORAGE_EXTERNAL_URL}/${ReagentBucket.NOGGIN_RUN_INPUTS}/${filename}`,
  });
};
