/*
  Aul Bilim CMS content schema.

  Firestore collection layout:
  - site/content: singleton document for page copy, stats, and map data
  - media/assets/{assetId}: uploaded images/videos/embed metadata
  - stories/items/{storyId}: story cards and detail content
  - programs/items/{programId}: program content
  - enquiries/items/{enquiryId}: partner form submissions
*/
window.AUL_BILIM_SCHEMA = {
  contentDocument: "site/content",
  collections: {
    mediaAssets: "media/assets/items",
    stories: "stories/items",
    programs: "programs/items",
    enquiries: "enquiries/items"
  },
  mediaAsset: {
    id: "string",
    type: "image | video | youtube",
    url: "string",
    thumbnailUrl: "string?",
    alt: { kk: "string", en: "string" },
    caption: { kk: "string", en: "string" },
    crop: { x: "number", y: "number", scale: "number" },
    createdAt: "timestamp",
    updatedAt: "timestamp"
  },
  pageCopy: {
    "index.html": {
      cp0: "html-safe string"
    }
  },
  story: {
    id: "string",
    slug: "string",
    title: { kk: "string", en: "string" },
    excerpt: { kk: "string", en: "string" },
    body: { kk: "markdown/plain string", en: "markdown/plain string" },
    regionId: "string",
    programId: "string",
    mediaAssetId: "string?",
    youtubeUrl: "string?",
    published: "boolean",
    publishedAt: "timestamp"
  },
  enquiry: {
    name: "string",
    org: "string?",
    email: "string",
    phone: "string?",
    type: "corporate | government | individual",
    message: "string?",
    lang: "kk | en",
    submittedAt: "timestamp",
    status: "new | contacted | closed"
  }
};
