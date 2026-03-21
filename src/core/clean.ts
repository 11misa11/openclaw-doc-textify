import * as cheerio from 'cheerio'

export function cleanArticleHtml(html: string): string {
  const $ = cheerio.load(html)
  $('nav, footer, script, style, noscript, aside').remove()
  $('[aria-hidden="true"]').remove()
  return $('body').length > 0 ? $('body').html() || '' : $.root().html() || ''
}
