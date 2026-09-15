import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';



export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Khu vực quản trị và API không nên xuất hiện trên kết quả tìm kiếm
      disallow: ['/admin', '/admin/', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
