import type { MetadataRoute } from 'next';

const SITE_URL = 'https://getpiforge.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/lab',      // private app — requires login
          '/api/',     // API routes
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
