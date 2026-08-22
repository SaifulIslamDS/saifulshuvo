import { cache } from "react";
import { MEDIA_FIELDS, type WpMediaEdge } from "@/lib/wordpress/helpers";
import { wpGraphql } from "@/lib/wordpress/client";

export type SiteSettingsFields = {
  ownerName?: string | null;
  professionalTitle?: string | null;
  shortBio?: string | null;
  contactEmail?: string | null;
  location?: string | null;
  availability?: string | null;
  profileImage?: WpMediaEdge;
  cv?: WpMediaEdge;
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  website?: string | null;
  heroEyebrow?: string | null;
  heroHeading?: string | null;
  heroEmphasis?: string | null;
  heroLead?: string | null;
  heroPrimaryLabel?: string | null;
  heroPrimaryHref?: string | null;
  heroSecondaryLabel?: string | null;
  heroSecondaryHref?: string | null;
  aboutEyebrow?: string | null;
  aboutTitle?: string | null;
  aboutDescription?: string | null;
  aboutParagraphs?: Array<{ text?: string | null }> | null;
  positioningTitle?: string | null;
  positioningPoints?: Array<{ text?: string | null }> | null;
  processItems?: Array<{ number?: string | null; title?: string | null; description?: string | null }> | null;
  workPrinciples?: Array<{ text?: string | null }> | null;
  ctaEyebrow?: string | null;
  ctaTitle?: string | null;
  ctaDescription?: string | null;
  ctaPrimaryLabel?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
  showAbout?: boolean | null;
  showExperience?: boolean | null;
  showServices?: boolean | null;
  showSkills?: boolean | null;
  showProjects?: boolean | null;
  showBlog?: boolean | null;
  showProcess?: boolean | null;
  showCta?: boolean | null;
  homepageStats?: Array<{ value?: string | null; label?: string | null }> | null;
  seoDefaultTitle?: string | null;
  seoTitleTemplate?: string | null;
  seoDescription?: string | null;
  seoKeywords?: Array<{ keyword?: string | null }> | null;
  defaultOgImage?: WpMediaEdge;
  twitterHandle?: string | null;
  indexSite?: boolean | null;
  googleSiteVerification?: string | null;
  bingSiteVerification?: string | null;
  analyticsProvider?: string[] | string | null;
  analyticsMeasurementId?: string | null;
  analyticsDomain?: string | null;
  analyticsConsentRequired?: boolean | null;
  analyticsRespectDnt?: boolean | null;
  analyticsCollectPageViews?: boolean | null;
  analyticsCollectWebVitals?: boolean | null;
  analyticsCollectClientErrors?: boolean | null;
  analyticsRetentionDays?: number | null;
};

type SiteSettingsQuery = {
  siteSettings?: {
    siteSettingsFields?: SiteSettingsFields | null;
  } | null;
};

const SITE_SETTINGS_QUERY = `
  query SaifulShuvoSiteSettings {
    siteSettings {
      siteSettingsFields {
        ownerName
        professionalTitle
        shortBio
        contactEmail
        location
        availability
        profileImage { node { ${MEDIA_FIELDS} } }
        cv { node { ${MEDIA_FIELDS} } }
        github
        linkedin
        facebook
        website
        heroEyebrow
        heroHeading
        heroEmphasis
        heroLead
        heroPrimaryLabel
        heroPrimaryHref
        heroSecondaryLabel
        heroSecondaryHref
        aboutEyebrow
        aboutTitle
        aboutDescription
        aboutParagraphs { text }
        positioningTitle
        positioningPoints { text }
        processItems { number title description }
        workPrinciples { text }
        ctaEyebrow
        ctaTitle
        ctaDescription
        ctaPrimaryLabel
        ctaPrimaryHref
        ctaSecondaryLabel
        ctaSecondaryHref
        showAbout
        showExperience
        showServices
        showSkills
        showProjects
        showBlog
        showProcess
        showCta
        homepageStats { value label }
        seoDefaultTitle
        seoTitleTemplate
        seoDescription
        seoKeywords { keyword }
        defaultOgImage { node { ${MEDIA_FIELDS} } }
        twitterHandle
        indexSite
        googleSiteVerification
        bingSiteVerification
        analyticsProvider
        analyticsMeasurementId
        analyticsDomain
        analyticsConsentRequired
        analyticsRespectDnt
        analyticsCollectPageViews
        analyticsCollectWebVitals
        analyticsCollectClientErrors
        analyticsRetentionDays
      }
    }
  }
`;

export const getSiteSettingsFields = cache(async (): Promise<SiteSettingsFields> => {
  const data = await wpGraphql<SiteSettingsQuery>(SITE_SETTINGS_QUERY);
  const fields = data.siteSettings?.siteSettingsFields;
  if (!fields) {
    throw new Error(
      "WordPress GraphQL did not return siteSettings.siteSettingsFields. Verify the ACF Options Page and Site Settings field group are exposed in GraphQL.",
    );
  }
  return fields;
});
