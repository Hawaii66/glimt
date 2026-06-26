import type { Id } from "convex/_generated/dataModel";

import { uploadImageToStorage } from "@/lib/uploadImageToStorage";

type UploadGlimtPhotoArgs = {
  localUri: string;
  generateUploadUrl: () => Promise<string>;
};

export async function uploadGlimtPhotoToStorage({
  localUri,
  generateUploadUrl,
}: UploadGlimtPhotoArgs): Promise<Id<"_storage">> {
  return uploadImageToStorage({
    localUri,
    generateUploadUrl,
    failureMessage: "Failed to upload glimt photo.",
  });
}
