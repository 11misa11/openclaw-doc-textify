import { describe, expect, it } from 'vitest'
import { discoverLinksFromHtml } from '../../src/crawl/discover.js'

describe('discoverLinksFromHtml', () => {
  it('keeps same-host absolute URLs and resolves relatives', () => {
    const html = `
      <a href="/start/getting-started">start</a>
      <a href="https://docs.openclaw.ai/web/control-ui">web</a>
      <a href="https://example.com/outside">outside</a>
    `

    const urls = discoverLinksFromHtml(html, 'https://docs.openclaw.ai/', {
      allowedHost: 'docs.openclaw.ai',
    })

    expect(urls).toContain('https://docs.openclaw.ai/start/getting-started')
    expect(urls).toContain('https://docs.openclaw.ai/web/control-ui')
    expect(urls).not.toContain('https://example.com/outside')
  })
})
