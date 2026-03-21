import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export type ExtractedContent = {
  title: string
  html: string
  text: string
}

export function extractReadableContent(html: string): ExtractedContent {
  const dom = new JSDOM(html, { url: 'https://example.com' })
  const reader = new Readability(dom.window.document)
  const article = reader.parse()

  if (article?.content && article.textContent) {
    return {
      title: article.title || 'Untitled',
      html: article.content,
      text: article.textContent.trim(),
    }
  }

  const title = dom.window.document.title || 'Untitled'
  const bodyHtml = dom.window.document.body?.innerHTML || html
  const text = dom.window.document.body?.textContent?.trim() || ''

  return {
    title,
    html: bodyHtml,
    text,
  }
}
