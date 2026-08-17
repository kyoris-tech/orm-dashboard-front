import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/home', '/admin', '/metrics', '/login', '/api/'],
    },
    sitemap: 'https://useorm.com/sitemap.xml',
  };
}
