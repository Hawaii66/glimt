import { File, UploadType } from 'expo-file-system';

import type { Id } from 'convex/_generated/dataModel';

type UploadImageArgs = {
  localUri: string;
  generateUploadUrl: () => Promise<string>;
  failureMessage?: string;
};

function guessMimeType(uri: string) {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) {
    return 'image/png';
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp';
  }
  if (lower.endsWith('.heic')) {
    return 'image/heic';
  }
  return 'image/jpeg';
}

export async function uploadImageToStorage({
  localUri,
  generateUploadUrl,
  failureMessage = 'Failed to upload image.',
}: UploadImageArgs): Promise<Id<'_storage'>> {
  const uploadUrl = await generateUploadUrl();
  const contentType = guessMimeType(localUri);
  const file = new File(localUri);

  const result = await file.upload(uploadUrl, {
    httpMethod: 'POST',
    uploadType: UploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': contentType,
    },
    mimeType: contentType,
  });

  if (result.status < 200 || result.status >= 300) {
    throw new Error(failureMessage);
  }

  const { storageId } = JSON.parse(result.body) as {
    storageId: Id<'_storage'>;
  };

  return storageId;
}
