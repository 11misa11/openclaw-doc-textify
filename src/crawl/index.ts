import path from 'node:path'
import { fetchFromUrl } from '../core/fetch.js'
import { writeUtf8 } from '../utils/fs.js'
import { discoverLinksFromHtml } from './discover.js'
import { UrlQueue } from './queue.js'
import { extractUrlsFromSitemapXml } from './sitemap.js'

export type CrawlResult = {
  discoveredUrls: string[]
  visitedUrls: string[]
}

export async function discoverFromUrl(targetUrl: string): Promise<string[]> {
  const html = await fetchFromUrl(targetUrl)
  return discoverLinksFromHtml(html, targetUrl, { allowedHost: new URL(targetUrl).host })
}

export async function discoverFromSitemap(sitemapUrl: string): Promise<string[]> {
  const xml = await fetchFromUrl(sitemapUrl)
  return extractUrlsFromSitemapXml(xml)
}

export async function crawlUrls(startUrl: string, limit = 20): Promise<CrawlResult> {
  const queue = new UrlQueue()
  const visited: string[] = []
  queue.add(startUrl)

  while (queue.size() > 0 && visited.length < limit) {
    const nextUrl = queue.next()
    if (!nextUrl) {
      break
    }

    visited.push(nextUrl)

    try {
      const html = await fetchFromUrl(nextUrl)
      const discovered = discoverLinksFromHtml(html, nextUrl, { allowedHost: new URL(startUrl).host })
      queue.addMany(discovered)
    } catch {
      // skip failed pages in Phase 1 skeleton
    }
  }

  return {
    visitedUrls: visited,
    discoveredUrls: queue.snapshot(),
  }
}

export async function writeCrawlIndex(outDir: string, urls: string[]): Promise<string> {
  const filePath = path.join(outDir, 'index.json')
  await writeUtf8(filePath, JSON.stringify({ count: urls.length, urls }, null, 2))
  return filePath
}
