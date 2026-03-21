#!/usr/bin/env node
import path from 'node:path'
import { Command } from 'commander'
import { fetchFromFile, fetchFromUrl } from '../core/fetch.js'
import { extractReadableContent } from '../core/extract.js'
import { cleanArticleHtml } from '../core/clean.js'
import { htmlToMarkdown, normalizeText } from '../core/normalize.js'
import { writeDocumentOutputs } from '../core/serialize.js'
import { crawlUrls, discoverFromSitemap, discoverFromUrl, writeCrawlIndex } from '../crawl/index.js'
import { logError, logInfo } from '../utils/logger.js'
import type { TextifiedDocument } from '../types/document.js'

async function run(sourceType: 'url' | 'file', input: string, outDir: string): Promise<void> {
  const raw = sourceType === 'url' ? await fetchFromUrl(input) : await fetchFromFile(input)
  const extracted = extractReadableContent(raw)
  const cleanedHtml = cleanArticleHtml(extracted.html)
  const markdown = htmlToMarkdown(cleanedHtml)
  const text = normalizeText(extracted.text)

  const document: TextifiedDocument = {
    title: extracted.title,
    text,
    markdown,
    sourceType,
    sourcePathOrUrl: input,
    fetchedAt: new Date().toISOString(),
  }

  const result = await writeDocumentOutputs(document, path.resolve(outDir))
  logInfo(`saved md: ${result.mdPath}`)
  logInfo(`saved txt: ${result.txtPath}`)
}

const program = new Command()

program.name('textify').description('OpenClaw docs/text HTML を text/markdown に変換する CLI')

program
  .command('url')
  .argument('<targetUrl>')
  .option('-o, --out <dir>', 'output directory', './output')
  .action(async (targetUrl: string, options: { out: string }) => {
    try {
      await run('url', targetUrl, options.out)
    } catch (error) {
      logError(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('file')
  .argument('<filePath>')
  .option('-o, --out <dir>', 'output directory', './output')
  .action(async (filePath: string, options: { out: string }) => {
    try {
      await run('file', path.resolve(filePath), options.out)
    } catch (error) {
      logError(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('discover')
  .argument('<targetUrl>')
  .action(async (targetUrl: string) => {
    try {
      const urls = await discoverFromUrl(targetUrl)
      urls.forEach((url) => console.log(url))
    } catch (error) {
      logError(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('sitemap')
  .argument('<sitemapUrl>')
  .option('-o, --out <dir>', 'output directory', './output')
  .action(async (sitemapUrl: string, options: { out: string }) => {
    try {
      const urls = await discoverFromSitemap(sitemapUrl)
      const indexPath = await writeCrawlIndex(path.resolve(options.out), urls)
      logInfo(`saved index: ${indexPath}`)
    } catch (error) {
      logError(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program
  .command('crawl')
  .argument('<startUrl>')
  .option('-o, --out <dir>', 'output directory', './output')
  .option('-l, --limit <number>', 'max pages to visit', '20')
  .action(async (startUrl: string, options: { out: string; limit: string }) => {
    try {
      const result = await crawlUrls(startUrl, Number(options.limit))
      const indexPath = await writeCrawlIndex(path.resolve(options.out), result.visitedUrls)
      logInfo(`saved index: ${indexPath}`)
      logInfo(`visited: ${result.visitedUrls.length}`)
      logInfo(`queued: ${result.discoveredUrls.length}`)
    } catch (error) {
      logError(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program.parseAsync(process.argv)
