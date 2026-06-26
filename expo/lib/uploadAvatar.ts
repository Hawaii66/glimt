import type { Id } from 'convex/_generated/dataModel';

function guessContentType(uri: string) {
  const extension = uri.split('.').pop()?.toLowerCase();
  if (extension === 'png') {
    return 'image/png';
  }
  if (extension === 'webp') {
    return 'image/webp';
  }
  if (extension === 'heic' || extension === 'heif') {
    return 'image/heic';
  }
  return 'image/jpeg';
}

export async function uploadAvatarToConvex(
  uploadUrl: string,
  localUri: string,
): Promise<Id<'_storage'>> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': guessContentType(localUri) },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload profile photo.');
  }

  const { storageId } = (await uploadResponse.json()) as {
    storageId: Id<'_storage'>;
  };

  return storageId;
}
