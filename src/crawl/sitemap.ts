export function extractUrlsFromSitemapXml(xml: string): string[] {
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gims)]
  return matches
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value))
}
