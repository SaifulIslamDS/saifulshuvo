import { cache } from "react";
import { mediaNode } from "@/lib/wordpress/helpers";
import { mapWordPressMedia } from "@/lib/wordpress/media-mapper";
import { getSiteSettingsFields } from "@/lib/wordpress/queries/site-settings";
import type { CvDocument, PublicSiteMedia } from "@/types/media";

export const getPublicSiteMedia = cache(async (): Promise<PublicSiteMedia> => {
  const fields = await getSiteSettingsFields();
  const profileImage = mapWordPressMedia(mediaNode(fields.profileImage), "profile");
  const cvAsset = mapWordPressMedia(mediaNode(fields.cv), "cv");
  const activeCv: CvDocument | null = cvAsset
    ? {
      id: cvAsset.id,
      mediaAssetId: cvAsset.id,
      title: cvAsset.originalName,
      versionLabel: "Current",
      createdAt: cvAsset.createdAt,
      updatedAt: cvAsset.updatedAt,
      isActive: true,
      media: cvAsset,
    }
    : null;
  return { profileImage, activeCv };
});
