import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from '@/lib/uploadthing';

// Force Node.js runtime để tránh Edge runtime issues
export const runtime = 'nodejs';

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    // v7 dùng UPLOADTHING_TOKEN (base64 chứa apiKey + appId + region)
    token: process.env.UPLOADTHING_TOKEN,
  },
});
