import { describe, expect, it } from 'vitest'
import { extractUrlsFromSitemapXml } from '../../src/crawl/sitemap.js'

describe('extractUrlsFromSitemapXml', () => {
  it('extracts loc entries', () => {
    const xml = `
      <urlset>
        <url><loc>https://docs.openclaw.ai/</loc></url>
        <url><loc>https://docs.openclaw.ai/start/getting-started</loc></url>
      </urlset>
    `

    expect(extractUrlsFromSitemapXml(xml)).toEqual([
      'https://docs.openclaw.ai/',
      'https://docs.openclaw.ai/start/getting-started',
    ])
  })
})
