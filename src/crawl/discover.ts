import * as cheerio from 'cheerio'

export type DiscoverOptions = {
  allowedHost?: string
}

export function normalizeDiscoveredUrl(rawUrl: string, baseUrl: string): string | null {
  try {
    const url = new URL(rawUrl, baseUrl)
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

export function discoverLinksFromHtml(html: string, baseUrl: string, options: DiscoverOptions = {}): string[] {
  const $ = cheerio.load(html)
  const links = new Set<string>()

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href')
    if (!href) {
      return
    }

    const normalized = normalizeDiscoveredUrl(href, baseUrl)
    if (!normalized) {
      return
    }

    const parsed = new URL(normalized)
    if (options.allowedHost && parsed.host !== options.allowedHost) {
      return
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return
    }

    links.add(parsed.toString())
  })

  return [...links]
}
