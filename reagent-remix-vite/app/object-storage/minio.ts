import * as Minio from '@timothyaveni/minio';
import { ReagentBucket } from 'reagent-noggin-shared/object-storage-buckets';

// frustratingly, i can't use an internal host here -- https://github.com/minio/minio-js/issues/514
export const minioClient = new Minio.Client({
  endPoint: process.env.OBJECT_STORAGE_INTERNAL_HOST!,
  port: parseInt(process.env.OBJECT_STORAGE_INTERNAL_PORT || '', 10),
  useSSL: process.env.OBJECT_STORAGE_INTERNAL_USE_SSL === 'true',
  accessKey: process.env.OBJECT_STORAGE_ACCESS_KEY!,
  secretKey: process.env.OBJECT_STORAGE_SECRET_KEY!,
});

// todo ehh we might get rid of this bc we probably will just make a boot script that also configures the policy
export const getBucket = async (bucketName: ReagentBucket): Promise<string> => {
  if (await minioClient.bucketExists(bucketName)) {
    return bucketName;
  }
  // smol race condition
  await minioClient.makeBucket(bucketName);
  return bucketName;
};

// const getObjectStorageInternalUrl = () => {
//   const protocol =
//     process.env.OBJECT_STORAGE_INTERNAL_USE_SSL === 'true' ? 'https' : 'http';
//   const port =
//     (protocol === 'http' &&
//       process.env.OBJECT_STORAGE_INTERNAL_PORT === '80') ||
//     (protocol === 'https' && process.env.OBJECT_STORAGE_INTERNAL_PORT === '443')
//       ? ''
//       : `:${process.env.OBJECT_STORAGE_INTERNAL_PORT}`;
//   return `${protocol}://${process.env.OBJECT_STORAGE_INTERNAL_HOST}${port}`;
// };

// export const convertInternalUrlToExternalUrl = (
//   internalUrl: string,
// ): string => {
//   if (!internalUrl.startsWith(getObjectStorageInternalUrl())) {
//     throw new Error('Internal URL does not match expected format');
//   }

//   return (
//     process.env.OBJECT_STORAGE_EXTERNAL_URL! +
//     internalUrl.substring(getObjectStorageInternalUrl().length)
//   );
// };
