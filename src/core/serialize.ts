import path from 'node:path'
import { writeUtf8 } from '../utils/fs.js'
import { toSafeSlug } from '../utils/url.js'
import type { TextifiedDocument } from '../types/document.js'

function buildMarkdownOutput(document: TextifiedDocument): string {
  const metadata = [
    `# ${document.title}`,
    '',
    `- sourceType: ${document.sourceType}`,
    `- source: ${document.sourcePathOrUrl}`,
    `- fetchedAt: ${document.fetchedAt}`,
    '',
    '---',
    '',
  ].join('\n')

  return `${metadata}${document.markdown}`.trim() + '\n'
}

function buildTextOutput(document: TextifiedDocument): string {
  const metadata = [
    `title: ${document.title}`,
    `sourceType: ${document.sourceType}`,
    `source: ${document.sourcePathOrUrl}`,
    `fetchedAt: ${document.fetchedAt}`,
    '',
  ].join('\n')

  return `${metadata}${document.text}`.trim() + '\n'
}

export async function writeDocumentOutputs(document: TextifiedDocument, outDir: string): Promise<{ mdPath: string; txtPath: string }> {
  const slug = toSafeSlug(document.title || document.sourcePathOrUrl)
  const mdPath = path.join(outDir, `${slug}.md`)
  const txtPath = path.join(outDir, `${slug}.txt`)

  await writeUtf8(mdPath, buildMarkdownOutput(document))
  await writeUtf8(txtPath, buildTextOutput(document))

  return { mdPath, txtPath }
}
