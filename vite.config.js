import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { projects } from './src/data/content.js'

// Public address of the site, used for link previews and the sitemap.
// Override per environment with SITE_URL=https://example.org pnpm build
const SITE_URL = (process.env.SITE_URL || 'https://ucfca.netlify.app').replace(/\/$/, '')

const routes = [
  '/',
  '/about',
  '/history',
  '/executives',
  '/committees',
  '/projects',
  ...projects.map((p) => `/projects/${p.slug}`),
  '/membership',
  '/donate',
  '/constitution',
  '/events',
  '/news',
  '/gallery',
  '/contact',
]

function siteFiles() {
  return {
    name: 'ucfca-site-files',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', SITE_URL),
    generateBundle() {
      const urls = routes.map((r) => `  <url><loc>${SITE_URL}${r}</loc></url>`).join('\n')
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /checkin\nDisallow: /setup\nDisallow: /me\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), siteFiles()],
})
