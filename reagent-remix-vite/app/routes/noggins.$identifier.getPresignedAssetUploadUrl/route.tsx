import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import { ReagentBucketExternalUrl } from 'reagent-noggin-shared/object-storage-buckets';
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

  const bucketName = await getBucket('NOGGIN_RUN_INPUTS');
  const bucketExternalUrl = ReagentBucketExternalUrl['NOGGIN_RUN_INPUTS'];

  const externalHost = process.env.OBJECT_STORAGE_PRESIGNED_HOST;

  if (!externalHost) {
    throw new Error('Missing OBJECT_STORAGE_PRESIGNED_HOST');
  }

  const filename = `${uuid()}.${extension}`;

  // method, bucketName, objectName, expires, reqParams, requestDate, signedHost, cb
  let url: string = (
    await minioClient.presignedUrl(
      'PUT',
      bucketName,
      filename,
      60 * 60 * 24,
      {},
      new Date(),
      // @ts-expect-error this is added by @timothyaveni/minio
      externalHost,
    )
  ).toString(); // don't ask about the toString

  // console.log(
  //   'url',
  //   url,
  //   'PUT',
  //   await getBucket('NOGGIN_RUN_INPUTS'),
  //   filename,
  //   60 * 60 * 24,
  //   {},
  //   new Date(),
  //   externalHost,
  //   bucketExternalUrl,
  // );

  // TODO: toss this in prisma as well, linked to a noggin but not to a run yet

  // related to having to hack minio to accept different URLs for upload and public access
  const objectStorageExternalUrlIsHttps =
    !!bucketExternalUrl.startsWith('https');

  return json({
    presignedUrl: objectStorageExternalUrlIsHttps
      ? url.replace(/^https?/, 'https')
      : url,
    uploadUrl: `${bucketExternalUrl}/${filename}`,
  });
};
