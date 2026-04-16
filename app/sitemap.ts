import type { MetadataRoute } from 'next';

const SITE_URL = 'https://piforge.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // /lab is not indexed — omit from sitemap intentionally
  ];
}
