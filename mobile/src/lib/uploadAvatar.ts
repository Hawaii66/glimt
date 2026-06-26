import type { Id } from "convex/_generated/dataModel";

import { uploadImageToStorage } from "@/lib/uploadImageToStorage";

type UploadAvatarArgs = {
  localUri: string;
  generateUploadUrl: () => Promise<string>;
};

export async function uploadAvatarToStorage({
  localUri,
  generateUploadUrl,
}: UploadAvatarArgs): Promise<Id<"_storage">> {
  return uploadImageToStorage({
    localUri,
    generateUploadUrl,
    failureMessage: "Failed to upload avatar.",
  });
}
