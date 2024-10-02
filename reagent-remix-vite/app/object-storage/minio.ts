import * as Minio from '@timothyaveni/minio';
import {
  ReagentBucket,
  ReagentBucketId,
} from 'reagent-noggin-shared/object-storage-buckets.js';

export const minioClient = new Minio.Client({
  endPoint: process.env.OBJECT_STORAGE_INTERNAL_HOST!,
  port: parseInt(process.env.OBJECT_STORAGE_INTERNAL_PORT || '', 10),
  useSSL: process.env.OBJECT_STORAGE_INTERNAL_USE_SSL === 'true',
  accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY!,
  secretKey: process.env.OBJECT_STORAGE_SECRET_KEY!,
  pathStyle: process.env.OBJECT_STORAGE_PATH_TYPE === 'path',
});

// todo ehh we might get rid of this bc we probably will just make a boot script that also configures the policy
export const getBucket = async (bucketId: ReagentBucketId): Promise<string> => {
  const bucketName = ReagentBucket[bucketId];

  // console.log(
  //   'remix',
  //   { bucketId, bucketName },
  //   process.env.OBJECT_STORAGE_NOGGIN_RUN_OUTPUTS_BUCKET,
  // );

  if (await minioClient.bucketExists(bucketName)) {
    return bucketName;
  }
  // smol race condition
  await minioClient.makeBucket(bucketName);
  return bucketName;
};
